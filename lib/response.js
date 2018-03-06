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
  constructor(payload, statusCode = 200) {
    this.payload = payload;
    this.statusCode = statusCode;
  }
}
module.exports.ApiResponseClass = ApiResponse;
module.exports.ApiResponse = (...args) => new ApiResponse(...args);

// --------------------------

class JsonResponse extends ApiResponse {
  constructor(payload, statusCode) {
    super(JSON.stringify(payload), statusCode);
  }
}
module.exports.JsonResponse = (...args) => new JsonResponse(...args);
