const assert = require("assert");
const xor = require('lodash.xor');
const get = require('lodash.get');
const difference = require("lodash.difference");
const Joi = require("joi");
const objectScan = require("object-scan");
const yaml = require("yaml-boost");
const Rollbar = require('lambda-rollbar');
const Limiter = require('lambda-rate-limiter');
const param = require("./param");
const response = require("./response");
const swagger = require("./swagger");

const parse = (request, params, eventRaw) => {
  const expectedRequestMethod = request.split(" ")[0];
  const receivedRequestMethod = get(eventRaw, 'httpMethod');
  assert(receivedRequestMethod === expectedRequestMethod, "Request Method Mismatch");
  let body;
  try {
    body = JSON.parse(get(eventRaw, 'body', '{}'));
  } catch (e) {
    throw response.ApiError("Invalid Json Body detected.", 400, 99001, {
      value: get(eventRaw, 'body')
    });
  }
  const event = Object.assign({}, eventRaw, { body });

  const invalidQsParams = difference(
    Object.keys(event.queryStringParameters || {}),
    params.filter(p => p.position === "query").map(p => p.name)
  );
  if (invalidQsParams.length !== 0) {
    throw response.ApiError(`Invalid Query Param(s) detected.`, 400, 99004, {
      value: invalidQsParams
    });
  }

  const invalidJsonParams = difference(
    Object.keys(event.body || {}),
    params.filter(p => p.position === "json").map(p => p.name)
  );
  if (invalidJsonParams.length !== 0) {
    throw response.ApiError(`Invalid Json Body Param(s) detected.`, 400, 99005, {
      value: invalidJsonParams
    });
  }

  return Promise.resolve(params
    .reduce((prev, cur) => Object.assign(prev, {
      [cur.name
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (l, idx) => (idx === 0 ? l.toLowerCase() : l.toUpperCase()))
        .replace(/[^a-zA-Z0-9]+/g, '')]: cur.get(event)
    }), {}));
};

const generateResponse = (err, resp, rb, options) => {
  if (get(err, "isApiError") === true) {
    return rb.warning(err).then(() => Object.assign(
      {
        statusCode: err.statusCode,
        body: JSON.stringify({
          message: err.message,
          messageId: err.messageId,
          context: err.context
        })
      },
      Object.keys(options.defaultHeaders).length === 0 ? {} : { headers: options.defaultHeaders }
    ));
  }
  if (get(resp, "isApiResponse") === true) {
    const headers = Object.assign({}, options.defaultHeaders, resp.headers);
    return Object.assign(
      {
        statusCode: resp.statusCode,
        body: resp.payload
      },
      Object.keys(headers).length === 0 ? {} : { headers }
    );
  }
  throw err;
};

const staticExports = {
  Joi,
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
  List: param.List,
  StrList: param.StrList,
  FieldsParam: param.FieldsParam,
  Json: param.Json,
  NumberList: param.NumberList,
  GeoPoint: param.GeoPoint,
  GeoRect: param.GeoRect
};

const Api = (options = {}) => {
  const endpoints = {};
  const rollbar = Rollbar(get(options, 'rollbar', {}));
  const limiter = Limiter(get(options, 'limiter', {}));
  const defaultHeaders = get(options, 'defaultHeaders', {});

  const wrap = (request, params, limit, handler) => {
    if (request.startsWith("GET ") && params.filter(p => p.position === 'json').length !== 0) {
      throw new Error("Can not use JSON parameter with GET requests.");
    }
    if (params.filter(p => p.position === 'path').some(p => request.indexOf(`{${p.nameOriginal}}`) === -1)) {
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
        .then(paramsOut => handler(paramsOut, context, rb, event))
        .then(payload => generateResponse(null, payload, rb, { defaultHeaders }))
        .catch(err => generateResponse(err, null, rb, { defaultHeaders })));
  };

  const generateDifference = (swaggerFile, serverlessFile, serverlessVars) => {
    const serverlessData = yaml.load(serverlessFile, serverlessVars);
    const swaggerData = yaml.load(swaggerFile);

    const serverlessRequests = objectScan(["functions.*.events[*].http"], { joined: false })(serverlessData)
      .map(k => get(serverlessData, k))
      .map(e => `${e.method.toUpperCase()} ${e.path}`);
    const swaggerRequests = objectScan(["paths.*.*"], { joined: false })(swaggerData)
      .map(e => `${e[2].toUpperCase()} ${e[1].substring(1)}`);

    return xor(serverlessRequests, swaggerRequests);
  };

  return Object.assign({
    wrap,
    rollbar,
    generateSwagger: (existing = {}) => swagger(endpoints, existing),
    generateDifference
  }, staticExports);
};

module.exports = Object.assign({ Api }, staticExports);
