const { ApiError, ApiErrorClass } = require('./response/api-error');
const { ApiResponse, ApiResponseClass } = require('./response/api-response');
const { JsonResponse, JsonResponseClass } = require('./response/json-response');

module.exports.ApiError = ApiError;
module.exports.ApiErrorClass = ApiErrorClass;
module.exports.ApiResponse = ApiResponse;
module.exports.ApiResponseClass = ApiResponseClass;
module.exports.JsonResponse = JsonResponse;
module.exports.JsonResponseClass = JsonResponseClass;
