const assert = require('assert');
const path = require('path');
const get = require('lodash.get');
const difference = require('lodash.difference');
const Joi = require('joi-strict');
const { wrap } = require('lambda-async');
const Router = require('route-recognizer');
const { Module } = require('./module');
const param = require('./param');
const {
  ApiError,
  ApiErrorClass,
  ApiResponse,
  ApiResponseClass,
  JsonResponse,
  JsonResponseClass,
  BinaryResponse,
  BinaryResponseClass,
  asApiGatewayResponse
} = require('./response');
const swagger = require('./swagger');
const mergeSchemas = require('./util/merge-schemas');
const toCamelCase = require('./util/to-camel-case');
const objectAsLowerCase = require('./util/object-as-lower-case');

const parse = async (request, params, event) => {
  const expectedRequestMethod = request.split(' ')[0];
  const receivedRequestMethod = get(event, 'httpMethod');
  assert(receivedRequestMethod === expectedRequestMethod, 'Request Method Mismatch');

  const invalidQsParams = difference(
    Object.keys(event.queryStringParameters || {}),
    params.filter((p) => p.position === 'query').map((p) => p.name)
  );
  if (invalidQsParams.length !== 0) {
    throw ApiError('Invalid Query Param(s) detected.', 400, 99004, {
      value: invalidQsParams
    });
  }

  const invalidJsonParams = difference(
    Object.keys(event.body || {}),
    params.filter((p) => p.position === 'json').map((p) => p.name)
  );
  if (invalidJsonParams.length !== 0) {
    throw ApiError('Invalid Json Body Param(s) detected.', 400, 99005, {
      value: invalidJsonParams
    });
  }

  const paramsPending = params.map((curParam) => [toCamelCase(curParam.name), curParam.get(event)]);
  const paramsPendingObj = paramsPending.reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {});
  const resolvedParams = await Promise.all(paramsPending
    .map(async ([name, value]) => [name, typeof value === 'function' ? await value(paramsPendingObj) : value]));
  return resolvedParams.reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {});
};

const staticExports = {
  ApiError,
  ApiErrorClass,
  ApiResponse,
  ApiResponseClass,
  JsonResponse,
  JsonResponseClass,
  BinaryResponse,
  BinaryResponseClass,
  ...param
};

const Api = (options = {}) => {
  const schemas = [{
    routePrefix: Joi.string().optional()
  }];

  const module = new Module(path.join(__dirname, 'plugin'), options);
  schemas.push(...module.getSchemas());
  Joi.assert(options, mergeSchemas(schemas));

  const endpoints = {};
  const router = new Router();
  const routeSignatures = [];
  const routePrefix = get(options, 'routePrefix', '');

  const wrapper = (request, params, optionsOrHandler, handlerOrUndefined) => {
    const hasOptions = handlerOrUndefined !== undefined;
    assert(!hasOptions || (optionsOrHandler instanceof Object && !Array.isArray(optionsOrHandler)));
    const handler = hasOptions ? handlerOrUndefined : optionsOrHandler;
    assert(typeof handler === 'function');
    const endpointOptions = hasOptions ? optionsOrHandler : {};

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

    const wrapHandler = async ({
      event, context, hdl
    }) => {
      if (!event.httpMethod) {
        return Promise.resolve('OK - No API Gateway call detected.');
      }
      const response = await [
        () => {
          try {
            if (event.body !== undefined) {
              Object.assign(event, { body: JSON.parse(event.body) });
            }
          } catch (e) {
            throw ApiError('Invalid Json Body detected.', 400, 99001, {
              value: get(event, 'body')
            });
          }
          Object.assign(event, {
            headers: objectAsLowerCase(event.headers || {}),
            ...(event.multiValueHeaders !== undefined
              ? { multiValueHeaders: objectAsLowerCase(event.multiValueHeaders) }
              : {})
          });
        },
        () => module.before({
          event,
          context,
          request,
          router,
          options: endpointOptions
        }),
        ...hdl
      ]
        .reduce((p, c) => p.then(c), Promise.resolve())
        .then((payload) => asApiGatewayResponse(payload))
        .catch((err) => asApiGatewayResponse(err));
      await module.after({
        event,
        context,
        request,
        response,
        router,
        options: endpointOptions
      });
      return response;
    };

    const wrappedHandler = wrap((event, context) => wrapHandler({
      event,
      context,
      hdl: event.httpMethod === 'OPTIONS' ? [
        () => ApiResponse('', 403)
      ] : [
        () => parse(request, params, event),
        async (paramsOut) => {
          const result = await handler(paramsOut, context, event);
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
    router.add([{
      path: ['OPTIONS', ...pathSegments.slice(1)].join('/'),
      handler: wrappedHandler
    }]);
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
      return wrapper(`${requestParsed[1]} ${routePrefix}${requestParsed[2]}`, ...args);
    },
    router: routerFn,
    generateSwagger: () => swagger(endpoints),
    ...staticExports
  };
};

module.exports = { Api, ...staticExports };
