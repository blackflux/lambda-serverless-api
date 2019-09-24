const assert = require('assert');
const { wrap } = require('lambda-async');
const { wrap: wrapHandler } = require('./handler');

module.exports.Wrapper = ({ router, module }) => {
  const endpoints = {};

  const wrapFn = (identifier, params, optionsOrHandler, handlerOrUndefined) => {
    const hasOptions = handlerOrUndefined !== undefined;
    assert(!hasOptions || (optionsOrHandler instanceof Object && !Array.isArray(optionsOrHandler)));
    const handler = hasOptions ? handlerOrUndefined : optionsOrHandler;
    assert(typeof handler === 'function');
    const options = hasOptions ? optionsOrHandler : {};

    const request = {
      params,
      options,
      .../^(?<method>[A-Z]+)\s(?<uri>.+)$/.exec(identifier).groups
    };
    module.beforeRegister({ request });
    const route = `${request.method} ${request.uri}`;

    endpoints[route] = params;

    const handlerFn = wrapHandler({
      handler,
      request,
      route,
      router,
      module,
      params,
      options
    });
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
