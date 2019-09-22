const get = require('lodash.get');
const { wrap } = require('lambda-async');
const Router = require('route-recognizer');

module.exports.Router = () => {
  const router = new Router();

  const handler = wrap(async (event, context) => {
    if (!event.httpMethod) {
      return 'OK - No API Gateway call detected.';
    }
    const matchedRoutes = router.recognize(`${event.httpMethod}${get(event, 'path', '')}`);
    if (!matchedRoutes) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Method / Route not allowed' })
      };
    }
    return matchedRoutes[0].handler(Object.assign(event, {
      pathParameters: matchedRoutes[0].params
    }), context);
  });
  handler.isApiEndpoint = true;
  handler.route = 'ANY';

  return {
    handler,
    add: (...args) => router.add(...args),
    recognize: (...args) => router.recognize(...args)
  };
};
