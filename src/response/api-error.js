class ApiError extends Error {
  constructor(message, statusCode = 400, messageId = undefined, context = undefined) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = statusCode;
    this.headers = {};
    this.messageId = messageId;
    this.context = context;
    this.isJsonResponse = true;
    this.isApiResponse = true;
    this.isApiError = true;
  }
}
module.exports.ApiErrorClass = ApiError;
module.exports.ApiError = (...args) => new ApiError(...args);
