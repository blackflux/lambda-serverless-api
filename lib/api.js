const get = require('lodash.get');
const Rollbar = require('lambda-rollbar');
const Limiter = require('lambda-rate-limiter');
const param = require("./param");
const response = require("./response");
const swagger = require("./swagger");

const endpoints = {};

const Parser = (request, params) => {
  endpoints[request] = params;
  return (event) => {
    let body;
    try {
      body = JSON.parse(get(event, 'body', '{}'));
    } catch (e) {
      throw response.ApiError("Invalid Json Body detected.", 400, 99001, {
        value: get(event, 'body')
      });
    }
    const eventParsed = Object.assign({}, event, { body });
    params.forEach(p => p.feed(eventParsed));
    return Promise.resolve(params.map(p => p.get()));
  };
};


const generateResponse = (err, resp, callback, rb) => {
  if (err instanceof response.ApiErrorClass) {
    return rb.warning(err).then(callback(null, {
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message,
        messageId: err.messageId,
        context: err.context
      })
    }));
  }
  if (resp instanceof response.ApiResponseClass) {
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

  const wrap = (request, params, limit, handler) => {
    const parser = Parser(request, params);
    return rollbar
      .wrap((event, context, callback, rb) => limiter
        .check(limit, get(event, 'requestContext.identity.sourceIp'))
        .catch(() => {
          throw response.ApiError("Rate limit exceeded.", 429);
        })
        .then(() => parser(event))
        .then(paramsOut => handler(paramsOut, context, callback, rb))
        .then(payload => generateResponse(null, payload, callback, rb))
        .catch(err => generateResponse(err, null, callback, rb)));
  };

  return {
    wrap,
    generateSwagger: () => swagger(endpoints),
    ApiError: response.ApiError,
    ApiResponse: response.ApiResponse,
    JsonResponse: response.JsonResponse,
    Str: param.Str,
    Email: param.Email
  };
};
