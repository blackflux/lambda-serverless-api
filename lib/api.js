const get = require('lodash.get');
const Rollbar = require('lambda-rollbar');
const Limiter = require('lambda-rate-limiter');
const response = require("./response");

const generateResponse = (err, resp, callback, rb) => {
  if (err instanceof response.ApiError) {
    return rb.warning(err).then(callback(null, {
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message
      })
    }));
  }
  if (resp instanceof response.ApiResponse) {
    return callback(null, {
      statusCode: resp.statusCode,
      body: resp.payload
    });
  }
  return callback(err);
};

module.exports = (options = {}) => {
  const rollbar = Rollbar(get(options, 'rollbar', {}));
  const limiter = Limiter(get(options, 'limiter', {}));

  const wrap = (limit, handler) => rollbar
    .wrap((event, context, callback, rb) => limiter
      .check(limit, get(event, 'requestContext.identity.sourceIp'))
      .catch(() => {
        throw new response.ApiError("Rate limit exceeded.", 429);
      })
      .then(() => handler(event, context, callback, rb))
      .then(payload => generateResponse(null, payload, callback, rb))
      .catch(err => generateResponse(err, null, callback, rb)));

  return {
    wrap,
    ApiError: response.ApiError,
    ApiResponse: response.ApiResponse,
    JsonResponse: response.JsonResponse
  };
};
