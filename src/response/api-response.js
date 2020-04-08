class ApiResponse {
  constructor(payload, statusCode = 200, headers = {}) {
    this.payload = payload;
    this.statusCode = statusCode;
    this.headers = Object.entries(headers)
      .reduce((p, [k, v]) => {
        // eslint-disable-next-line no-param-reassign
        p[k.toLowerCase()] = v;
        return p;
      }, {});
    this.isApiResponse = true;
    this.isApiError = false;
  }
}
module.exports.ApiResponseClass = ApiResponse;
module.exports.ApiResponse = (...args) => new ApiResponse(...args);
