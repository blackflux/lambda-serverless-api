class ApiResponse {
  constructor(payload, statusCode = 200, headers = {}) {
    this.payload = payload;
    this.statusCode = statusCode;
    this.headers = headers;
    this.isApiResponse = true;
    this.isApiError = false;
  }
}
module.exports.ApiResponseClass = ApiResponse;
module.exports.ApiResponse = (...args) => new ApiResponse(...args);
