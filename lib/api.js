const get = require('lodash.get');
const rollbar = require('lambda-rollbar')({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.ENVIRONMENT,
  enabled: process.env.ENABLE_ROLLBAR === "true",
  verbose: process.env.VERBOSE === "1"
});
const limiter = require("lambda-rate-limiter")({
  interval: process.env.RATE_LIMIT_INTERVAL,
  uniqueTokenPerInterval: process.env.UNIQUE_IPS_PER_INTERVAL
});

class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = statusCode;
  }
}
module.exports.ApiError = ApiError;

class ApiResponse {
  constructor(payload, statusCode = 200) {
    this.payload = payload;
    this.statusCode = statusCode;
  }
}
module.exports.ApiResponse = ApiResponse;

class JsonResponse extends ApiResponse {
  constructor(payload, statusCode) {
    super(JSON.stringify(payload), statusCode);
  }
}
module.exports.JsonResponse = JsonResponse;

/* Generate generic 200 response for serverless */
const generateResponse = (err, resp, callback, rb) => {
  if (err instanceof ApiError) {
    return rb.warning(err).then(callback(null, {
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message
      })
    }));
  }
  if (resp instanceof ApiResponse) {
    return callback(null, {
      statusCode: resp.statusCode,
      body: resp.payload
    });
  }
  return callback(err);
};

/* Wrap Lambda function handler */
module.exports.wrap = (limit, handler) => rollbar
  .wrap((event, context, callback, rb) => limiter
    .check(limit, get(event, 'requestContext.identity.sourceIp'))
    .catch(() => {
      throw new ApiError("Rate limit exceeded.", 429);
    })
    .then(() => handler(event, context, callback, rb))
    .then(payload => generateResponse(null, payload, callback, rb))
    .catch(err => generateResponse(err, null, callback, rb)));
