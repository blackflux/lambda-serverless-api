const assert = require('assert');
const get = require('lodash.get');
const difference = require('lodash.difference');
const Joi = require('joi-strict');
const Rollbar = require('lambda-rollbar');
const Limiter = require('lambda-rate-limiter');
const Router = require('route-recognizer');
const param = require('./param');
const response = require('./response');
const swagger = require('./swagger');

// todo: separate functions out and generify

const normalizeName = (name) => name
  .replace(/(?:^\w|[A-Z]|\b\w)/g, (l, idx) => (idx === 0 ? l.toLowerCase() : l.toUpperCase()))
  .replace(/[^a-zA-Z0-9]+/g, '');

const parse = async (request, params, eventRaw) => {
  const expectedRequestMethod = request.split(' ')[0];
  const receivedRequestMethod = get(eventRaw, 'httpMethod');
  assert(receivedRequestMethod === expectedRequestMethod, 'Request Method Mismatch');
  let body;
  try {
    body = JSON.parse(get(eventRaw, 'body', '{}'));
  } catch (e) {
    throw response.ApiError('Invalid Json Body detected.', 400, 99001, {
      value: get(eventRaw, 'body')
    });
  }
  const event = { ...eventRaw, body };

  const invalidQsParams = difference(
    Object.keys(event.queryStringParameters || {}),
    params.filter((p) => p.position === 'query').map((p) => p.name)
  );
  if (invalidQsParams.length !== 0) {
    throw response.ApiError('Invalid Query Param(s) detected.', 400, 99004, {
      value: invalidQsParams
    });
  }

  const invalidJsonParams = difference(
    Object.keys(event.body || {}),
    params.filter((p) => p.position === 'json').map((p) => p.name)
  );
  if (invalidJsonParams.length !== 0) {
    throw response.ApiError('Invalid Json Body Param(s) detected.', 400, 99005, {
      value: invalidJsonParams
    });
  }

  const paramsPending = params.map((curParam) => [normalizeName(curParam.name), curParam.get(event)]);
  const paramsPendingObj = paramsPending.reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {});
  const resolvedParams = await Promise.all(paramsPending
    .map(async ([name, value]) => [name, typeof value === 'function' ? await value(paramsPendingObj) : value]));
  return resolvedParams.reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {});
};

const generateResponse = (err, resp, rb, options) => {
  if (get(err, 'isApiError') === true) {
    return rb.warning(err).then(() => ({
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message,
        messageId: err.messageId,
        context: err.context
      }),
      ...(Object.keys(options.defaultHeaders).length === 0 ? {} : { headers: options.defaultHeaders })
    }));
  }
  if (get(resp, 'isApiResponse') === true) {
    const headers = { ...options.defaultHeaders, ...resp.headers };
    return {
      statusCode: resp.statusCode,
      body: get(resp, 'isJsonResponse') === true ? JSON.stringify(resp.payload) : resp.payload,
      ...(Object.keys(headers).length === 0 ? {} : { headers })
    };
  }
  throw err;
};

const staticExports = {
  Joi,
  ApiError: response.ApiError,
  ApiErrorClass: response.ApiErrorClass,
  ApiResponse: response.ApiResponse,
  ApiResponseClass: response.ApiResponseClass,
  JsonResponse: response.JsonResponse,
  JsonResponseClass: response.JsonResponseClass,
  Str: param.Str,
  Email: param.Email,
  RegEx: param.RegEx,
  UUID: param.UUID,
  IsoDate: param.IsoDate,
  Date: param.Date,
  Bool: param.Bool,
  Enum: param.Enum,
  Int: param.Int,
  List: param.List,
  StrList: param.StrList,
  FieldsParam: param.FieldsParam,
  Json: param.Json,
  Number: param.Number,
  NumberList: param.NumberList,
  GeoPoint: param.GeoPoint,
  GeoRect: param.GeoRect,
  GeoShape: param.GeoShape
};

const Api = (options = {}) => {
  // todo: verify options against joi schema

  const endpoints = {};
  const router = new Router();
  const routeSignatures = [];
  const routePrefix = get(options, 'routePrefix', '');
  const rollbar = Rollbar(get(options, 'rollbar', {}));
  const limiter = Limiter(get(options, 'limiter', {}));
  const defaultHeaders = get(options, 'defaultHeaders', {});
  const preflightCheck = get(options, 'preflightCheck', () => false);
  const preflightHandlers = {};
  const preRequestHook = get(options, 'preRequestHook');

  const generateDefaultHeaders = (inputHeaders) => (typeof defaultHeaders === 'function'
    ? defaultHeaders(Object
      .entries(inputHeaders || {})
      .reduce((p, [k, v]) => Object.assign(p, { [normalizeName(k)]: v }), {}))
    : defaultHeaders);

  const wrap = (request, params, optionsOrHandler, handlerOrUndefined) => {
    const hasOptions = handlerOrUndefined !== undefined;
    assert(!hasOptions || (optionsOrHandler instanceof Object && !Array.isArray(optionsOrHandler)));
    const handler = hasOptions ? handlerOrUndefined : optionsOrHandler;
    assert(typeof handler === 'function');
    const opt = {
      limit: get(options, 'limit', 100),
      ...(hasOptions ? optionsOrHandler : {})
    };

    if (request.startsWith('GET ') && params.filter((p) => p.position === 'json').length !== 0) {
      throw new Error('Can not use JSON parameter with GET requests.');
    }
    if (params.filter((p) => p.position === 'path').some((p) => request.indexOf(`{${p.nameOriginal}}`) === -1)) {
      throw new Error('Path Parameter not defined in given path.');
    }
    if (params.filter((p) => p.paramType === 'FieldsParam' && typeof p.autoPrune === 'string').length > 1) {
      throw new Error('Only one auto pruning "FieldsParam" per endpoint.');
    }
    endpoints[request] = params;
    const rawAutoPruneFieldsParam = params
      .find((p) => p.paramType === 'FieldsParam' && typeof p.autoPrune === 'string');

    const wrapHandler = ({
      event, context, rb, hdl
    }) => {
      if (!event.httpMethod) {
        return Promise.resolve('OK - No API Gateway call detected.');
      }
      return [
        () => (typeof preRequestHook === 'function' ? preRequestHook(event, context, rb) : Promise.resolve()),
        () => (opt.limit === null ? Promise.resolve() : limiter
          .check(opt.limit, `${get(event, 'requestContext.identity.sourceIp')}/${request}`)
          .catch(() => {
            throw response.ApiError('Rate limit exceeded.', 429);
          })),
        ...hdl
      ]
        .reduce((p, c) => p.then(c), Promise.resolve())
        .then(async (payload) => generateResponse(null, payload, rb, {
          defaultHeaders: await generateDefaultHeaders(event.headers)
        }))
        .catch(async (err) => generateResponse(err, null, rb, {
          defaultHeaders: await generateDefaultHeaders(event.headers)
        }));
    };

    const wrappedHandler = rollbar
      .wrap((event, context, rb) => wrapHandler({
        event,
        context,
        rb,
        hdl: [
          () => parse(request, params, event),
          async (paramsOut) => {
            const result = await handler(paramsOut, context, rb, event);
            if (rawAutoPruneFieldsParam !== undefined && paramsOut[rawAutoPruneFieldsParam.name] !== undefined) {
              rawAutoPruneFieldsParam.pruneFields(result, paramsOut[rawAutoPruneFieldsParam.name]);
            }
            return result;
          }
        ]
      }));
    wrappedHandler.isApiEndpoint = true;
    wrappedHandler.request = request;

    // test for route collisions
    const routeSignature = request.split(/[\s/]/g).map((e) => e.replace(/^{.*?}$/, ':param'));
    routeSignatures.forEach((signature) => {
      if (routeSignature.length !== signature.length) {
        return;
      }
      for (let idx = 0; idx < signature.length; idx += 1) {
        if (signature[idx] !== routeSignature[idx]) {
          return;
        }
      }
      throw new Error(`Path collision: ${request}`);
    });
    routeSignatures.push(routeSignature);

    const pathSegments = request.split(/[\s/]/g).map((e) => e.replace(
      /^{(.*?)(\+)?}$/,
      (_, name, type) => `${type === '+' ? '*' : ':'}${name}`
    ));
    router.add([{
      path: pathSegments.join('/'),
      handler: wrappedHandler
    }]);
    const optionsPath = ['OPTIONS', ...pathSegments.slice(1)].join('/');
    if (preflightHandlers[optionsPath] === undefined) {
      preflightHandlers[optionsPath] = ['OPTIONS'];

      const optionsHandler = rollbar
        .wrap((event, context, rb) => wrapHandler({
          event,
          context,
          rb,
          hdl: [
            async () => {
              const headersRelevant = Object.entries(event.headers || {})
                .map(([h, v]) => [normalizeName(h), v])
                .filter(([h, v]) => [
                  'accessControlRequestMethod',
                  'accessControlRequestHeaders',
                  'origin'
                ].includes(h))
                .reduce((p, [h, v]) => Object.assign(p, { [h]: v }), {});
              const preflightHandlerParams = {
                path: pathSegments.slice(1).join('/'),
                allowedMethods: preflightHandlers[optionsPath],
                ...headersRelevant
              };
              const preflightHandlerResponse = await preflightCheck(preflightHandlerParams);
              const pass = preflightHandlerResponse instanceof Object && !Array.isArray(preflightHandlerResponse);
              return response.ApiResponse('', pass ? 200 : 403, pass ? preflightHandlerResponse : {});
            }
          ]
        }));
      optionsHandler.isApiEndpoint = true;
      optionsHandler.request = optionsPath;
      router.add([{ path: optionsPath, handler: optionsHandler }]);
    }
    preflightHandlers[optionsPath].push(pathSegments[0].toUpperCase());

    return wrappedHandler;
  };

  // IMPORTANT: Never return from this vanilla lambda function
  const routerFn = (event, context, callback, ...args) => {
    if (!event.httpMethod) {
      callback(null, 'OK - No API Gateway call detected.');
    } else {
      const matchedRoutes = router.recognize(`${event.httpMethod}${get(event, 'path', '')}`);
      if (!matchedRoutes) {
        callback(null, {
          statusCode: 403,
          body: JSON.stringify({ message: 'Method / Route not allowed' })
        });
      } else {
        matchedRoutes[0].handler(Object.assign(event, {
          pathParameters: matchedRoutes[0].params
        }), context, callback, ...args);
      }
    }
  };
  routerFn.isApiEndpoint = true;
  routerFn.request = 'ANY';

  return {
    wrap: (request, ...args) => {
      const requestParsed = /^([A-Z]+)\s(.+)$/.exec(request);
      assert(Array.isArray(requestParsed) && requestParsed.length === 3);
      return wrap(`${requestParsed[1]} ${routePrefix}${requestParsed[2]}`, ...args);
    },
    rollbar,
    router: routerFn,
    generateSwagger: () => swagger(endpoints),
    ...staticExports
  };
};

module.exports = { Api, ...staticExports };
