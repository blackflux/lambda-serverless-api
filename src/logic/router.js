const get = require('lodash.get');
const Router = require('route-recognizer');
const apiGateway = require('./api-gateway');
const { ApiError } = require('../response');

module.exports.Router = ({ module }) => {
  const router = (() => {
    const routerRec = new Router();
    return {
      register: (route, handler) => routerRec.add([{
        path: route.split(/[\s/]/g).map((e) => e.replace(
          /^{(.*?)(\+)?}$/,
          (_, name, type) => `${type === '+' ? '*' : ':'}${name}`
        )).join('/'),
        handler
      }]),
      recognize: (method, path) => routerRec.recognize(`${method}${path}`)
    };
  })();

  const handler = async (event, context) => {
    const matchedRoutes = router.recognize(event.httpMethod, get(event, 'path', ''));
    if (!matchedRoutes) {
      const request = {
        params: [],
        options: {},
        method: event.httpMethod,
        uri: get(event, 'path', '')
      };
      request.route = `${request.method} ${request.uri}`;
      return apiGateway.wrap({
        handler: async () => {
          const resp = await module.onUnhandled({
            event,
            context,
            router
          });
          if (resp === null) {
            throw ApiError('Method / Route not allowed', 403);
          }
          return resp;
        },
        request,
        router,
        module
      })(event, context);
    }
    return matchedRoutes[0].handler(Object.assign(event, {
      pathParameters: matchedRoutes[0].params
    }), context);
  };
  handler.isApiEndpoint = true;
  handler.route = 'ANY';

  return Object.assign(router, {
    handler: apiGateway.wrapAsync(handler)
  });
};
