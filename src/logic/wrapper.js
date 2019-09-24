const assert = require('assert');
const apiGateway = require('./api-gateway');

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
    (() => {
      const resp = module.beforeRegister({ request });
      assert(resp === null, 'Plugin should not return from beforeRegister()');
    })();
    request.route = `${request.method} ${request.uri}`;

    endpoints[request.route] = params;

    const handlerFn = apiGateway.wrap({
      handler,
      request,
      router,
      module,
      params
    });
    handlerFn.isApiEndpoint = true;
    handlerFn.route = request.route;

    router.register(request.route, handlerFn);
    (() => {
      const resp = module.afterRegister({ request });
      assert(resp === null, 'Plugin should not return from afterRegister()');
    })();

    return apiGateway.wrapAsync(handlerFn);
  };

  return {
    wrap: wrapFn,
    endpoints
  };
};
