const get = require('lodash.get');
const { wrap } = require('lambda-async');
const Router = require('route-recognizer');
const { ApiError } = require('../response');
const objectAsLowerCase = require('../util/object-as-lower-case');

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

  const handler = wrap(async (event, context) => {
    if (!event.httpMethod) {
      return 'OK - No API Gateway call detected.';
    }
    const matchedRoutes = router.recognize(event.httpMethod, get(event, 'path', ''));
    if (!matchedRoutes) {
      const response = {
        statusCode: 403,
        body: JSON.stringify({ message: 'Method / Route not allowed' })
      };
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
      await module.onUnhandled({
        event,
        context,
        router,
        response
      });
      await module.finalize({
        event,
        context,
        router,
        response
      });
      return response;
    }
    return matchedRoutes[0].handler(Object.assign(event, {
      pathParameters: matchedRoutes[0].params
    }), context);
  });
  handler.isApiEndpoint = true;
  handler.route = 'ANY';

  Object.assign(router, { handler });
  return router;
};
