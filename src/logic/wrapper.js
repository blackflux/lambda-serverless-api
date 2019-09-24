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
    request.route = `${request.method} ${request.uri}`;

    endpoints[request.route] = params;

    const handlerFn = wrapHandler({
      handler,
      request,
      router,
      module,
      params
    });
    handlerFn.isApiEndpoint = true;
    handlerFn.route = request.route;

    router.register(request.route, handlerFn);
    module.afterRegister({ request });

    return wrap(handlerFn);
  };

  return {
    wrap: wrapFn,
    endpoints
  };
};
