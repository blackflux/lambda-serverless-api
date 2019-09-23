const assert = require('assert');
const get = require('lodash.get');
const difference = require('lodash.difference');
const { wrap } = require('lambda-async');
const { ApiError, asApiGatewayResponse } = require('../response');
const toCamelCase = require('../util/to-camel-case');
const objectAsLowerCase = require('../util/object-as-lower-case');


module.exports.Wrapper = ({ router, module }) => {
  const endpoints = {};

  const wrapFn = (identifier, params, optionsOrHandler, handlerOrUndefined) => {
    const hasOptions = handlerOrUndefined !== undefined;
    assert(!hasOptions || (optionsOrHandler instanceof Object && !Array.isArray(optionsOrHandler)));
    const handler = hasOptions ? handlerOrUndefined : optionsOrHandler;
    assert(typeof handler === 'function');
    const endpointOptions = hasOptions ? optionsOrHandler : {};

    const request = {
      params,
      options: endpointOptions,
      .../^(?<method>[A-Z]+)\s(?<uri>.+)$/.exec(identifier).groups
    };
    module.beforeRegister({ request });
    const route = `${request.method} ${request.uri}`;

    endpoints[route] = params;
    const rawAutoPruneFieldsParam = params
      .find((p) => p.paramType === 'FieldsParam' && typeof p.autoPrune === 'string');

    const handlerFn = async (event, context) => {
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
          route,
          router,
          params,
          options: endpointOptions
        }),
        async () => {
          const receivedRequestMethod = get(event, 'httpMethod');
          assert(receivedRequestMethod === request.method, 'Request Method Mismatch');

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
          const paramsPendingObj = paramsPending.reduce((prev, [key, value]) => Object
            .assign(prev, { [key]: value }), {});
          const resolvedParams = await Promise.all(paramsPending
            .map(async ([name, value]) => [name, typeof value === 'function' ? await value(paramsPendingObj) : value]));
          return resolvedParams.reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {});
        },
        async (paramsOut) => {
          const result = await handler(paramsOut, context, event);
          if (rawAutoPruneFieldsParam !== undefined && paramsOut[rawAutoPruneFieldsParam.name] !== undefined) {
            rawAutoPruneFieldsParam.pruneFields(result, paramsOut[rawAutoPruneFieldsParam.name]);
          }
          return result;
        }
      ]
        .reduce((p, c) => p.then(c), Promise.resolve())
        .catch((err) => err);
      await module.after({
        event,
        context,
        route,
        response,
        router,
        params,
        options: endpointOptions
      });
      const apiGatewayResponse = asApiGatewayResponse(response);
      await module.finalize({
        event,
        context,
        route,
        response: apiGatewayResponse,
        router,
        params,
        options: endpointOptions
      });
      return apiGatewayResponse;
    };
    handlerFn.isApiEndpoint = true;
    handlerFn.route = route;

    const pathSegments = route.split(/[\s/]/g).map((e) => e.replace(
      /^{(.*?)(\+)?}$/,
      (_, name, type) => `${type === '+' ? '*' : ':'}${name}`
    ));
    router.add([{
      path: pathSegments.join('/'),
      handler: handlerFn
    }]);

    module.afterRegister({ request, route });

    return wrap(handlerFn);
  };

  return {
    wrap: wrapFn,
    endpoints
  };
};
