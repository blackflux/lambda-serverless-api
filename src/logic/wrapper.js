const assert = require('assert');
const { wrap } = require('lambda-async');
const { wrap: wrapHandler } = require('./handler');

module.exports.Wrapper = ({ router, module }) => {
  const endpoints = {};

  const wrapFn = (identifier, params, ...args) => {
    assert([1, 2].includes(args.length));
    const [options, handler] = args.length === 2 ? args : [{}, args[0]];
    assert(options instanceof Object && !Array.isArray(options));
    assert(typeof handler === 'function');

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
