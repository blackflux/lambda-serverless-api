class ApiError extends Error {
  constructor(message, statusCode = 400, messageId = undefined, context = undefined) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = statusCode;
    this.messageId = messageId;
    this.context = context;
  }
}
module.exports.ApiErrorClass = ApiError;
module.exports.ApiError = (...args) => new ApiError(...args);

class ApiResponse {
  constructor(payload, statusCode = 200, headers = {}) {
    this.payload = payload;
    this.statusCode = statusCode;
    this.headers = headers;
  }
}
module.exports.ApiResponseClass = ApiResponse;
module.exports.ApiResponse = (...args) => new ApiResponse(...args);

// --------------------------

class JsonResponse extends ApiResponse {
  constructor(payload, ...args) {
    super(JSON.stringify(payload), ...args);
  }
}
module.exports.JsonResponse = (...args) => new JsonResponse(...args);
