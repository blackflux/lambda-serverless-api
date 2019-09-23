const assert = require('assert');
const { wrap } = require('lambda-async');
const { asApiGatewayResponse } = require('../response');

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

    const handlerFn = async (event, context) => {
      if (!event.httpMethod) {
        return Promise.resolve('OK - No API Gateway call detected.');
      }
      const response = await [
        () => module.before({
          request,
          event,
          context,
          route,
          router,
          params,
          options: endpointOptions
        }),
        async () => handler(event.parsedParameters, context, event)
      ]
        .reduce((p, c) => p.then(c), Promise.resolve())
        .catch((err) => err);
      await module.after({
        request,
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
        request,
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

    router.register(route, handlerFn);

    module.afterRegister({ request, route });

    return wrap(handlerFn);
  };

  return {
    wrap: wrapFn,
    endpoints
  };
};
