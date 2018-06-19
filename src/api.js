const xor = require('lodash.xor');
const get = require('lodash.get');
const Rollbar = require('lambda-rollbar');
const Limiter = require('lambda-rate-limiter');
const yaml = require("yaml-boost");
const param = require("./param");
const response = require("./response");
const swagger = require("./swagger");
const objectScan = require("object-scan");

const parse = (request, params, event) => {
  const expectedRequestMethod = request.split(" ")[0];
  const receivedRequestMethod = get(event, 'httpMethod');
  if (receivedRequestMethod !== expectedRequestMethod) {
    throw response.ApiError(`Request Method "${expectedRequestMethod}" expected.`, 400, 99004, {
      value: receivedRequestMethod
    });
  }
  let body;
  try {
    body = JSON.parse(get(event, 'body', '{}'));
  } catch (e) {
    throw response.ApiError("Invalid Json Body detected.", 400, 99001, {
      value: get(event, 'body')
    });
  }
  const eventParsed = Object.assign({}, event, { body });
  return Promise.resolve(params.map(p => p.get(eventParsed)));
};

const generateResponse = (err, resp, rb) => {
  if (err instanceof response.ApiErrorClass) {
    return rb.warning(err).then(() => ({
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message,
        messageId: err.messageId,
        context: err.context
      })
    }));
  }
  if (resp instanceof response.ApiResponseClass) {
    return {
      statusCode: resp.statusCode,
      body: resp.payload,
      headers: resp.headers
    };
  }
  throw err;
};

module.exports = (options = {}) => {
  const endpoints = {};
  const rollbar = Rollbar(get(options, 'rollbar', {}));
  const limiter = Limiter(get(options, 'limiter', {}));

  const wrap = (request, params, limit, handler) => {
    if (request.startsWith("GET ") && params.filter(p => p.position === 'json').length !== 0) {
      throw new Error("Can not use JSON parameter with GET requests.");
    }
    if (params.filter(p => p.position === 'path').some(p => request.indexOf(`{${p.name}}`) === -1)) {
      throw new Error("Path Parameter not defined in given path.");
    }
    endpoints[request] = params;
    return rollbar
      .wrap((event, context, rb) => limiter
        .check(limit, get(event, 'requestContext.identity.sourceIp'))
        .catch(() => {
          throw response.ApiError("Rate limit exceeded.", 429);
        })
        .then(() => parse(request, params, event))
        .then(paramsOut => handler(paramsOut, context, rb))
        .then(payload => generateResponse(null, payload, rb))
        .catch(err => generateResponse(err, null, rb)));
  };

  const generateDifference = (swaggerFile, serverlessFile, serverlessVars) => {
    const serverlessData = yaml.load(serverlessFile, serverlessVars);
    const swaggerData = yaml.load(swaggerFile);

    const serverlessRequests = objectScan(["functions.*.events[*].http"])(serverlessData)
      .map(k => get(serverlessData, k)).map(e => `${e.method.toUpperCase()} ${e.path}`);
    const swaggerRequests = objectScan(["paths.*.*"])(swaggerData)
      .map(k => k.split(".")).map(e => `${e[2].toUpperCase()} ${e[1].substring(1)}`);

    return xor(serverlessRequests, swaggerRequests);
  };

  return {
    wrap,
    generateSwagger: (existing = {}) => swagger(endpoints, existing),
    generateDifference,
    ApiError: response.ApiError,
    ApiErrorClass: response.ApiErrorClass,
    ApiResponse: response.ApiResponse,
    ApiResponseClass: response.ApiResponseClass,
    JsonResponse: response.JsonResponse,
    JsonResponseClass: response.JsonResponseClass,
    Str: param.Str,
    Email: param.Email,
    RegEx: param.RegEx,
    UUID: param.UUID,
    Bool: param.Bool,
    Int: param.Int,
    StrList: param.StrList
  };
};
