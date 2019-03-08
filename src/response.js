const objectRewrite = require('object-rewrite');
const objPaths = require('obj-paths');
const cloneDeep = require('lodash.clonedeep');

class ApiError extends Error {
  constructor(message, statusCode = 400, messageId = undefined, context = undefined) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = statusCode;
    this.messageId = messageId;
    this.context = context;
    this.isApiError = true;
  }
}
module.exports.ApiErrorClass = ApiError;
module.exports.ApiError = (...args) => new ApiError(...args);

class ApiResponse {
  constructor(payload, statusCode = 200, headers = {}) {
    this.payload = payload;
    this.statusCode = statusCode;
    this.headers = headers;
    this.isApiResponse = true;
  }
}
module.exports.ApiResponseClass = ApiResponse;
module.exports.ApiResponse = (...args) => new ApiResponse(...args);

// --------------------------

class JsonResponse extends ApiResponse {
  constructor(...args) {
    super(...args);
    this.isJsonResponse = true;
  }
}
module.exports.JsonResponseClass = JsonResponse;
module.exports.JsonResponse = (...args) => new JsonResponse(...args);

module.exports.fieldProjection = (obj, projectionFields) => {
  const result = cloneDeep(obj);
  objectRewrite({ retain: objPaths.split(projectionFields) })(result);
  return result;
};
