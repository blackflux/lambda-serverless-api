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
