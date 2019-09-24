const { ApiError, ApiErrorClass } = require('./response/api-error');
const { ApiResponse, ApiResponseClass } = require('./response/api-response');
const { JsonResponse, JsonResponseClass } = require('./response/json-response');
const { BinaryResponse, BinaryResponseClass } = require('./response/binary-response');

module.exports.ApiError = ApiError;
module.exports.ApiErrorClass = ApiErrorClass;
module.exports.ApiResponse = ApiResponse;
module.exports.ApiResponseClass = ApiResponseClass;
module.exports.JsonResponse = JsonResponse;
module.exports.JsonResponseClass = JsonResponseClass;
module.exports.BinaryResponse = BinaryResponse;
module.exports.BinaryResponseClass = BinaryResponseClass;
