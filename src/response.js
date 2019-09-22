const get = require('lodash.get');
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

module.exports.asApiGatewayResponse = (resp) => {
  if (get(resp, 'isApiError') === true) {
    return {
      statusCode: resp.statusCode,
      body: JSON.stringify({
        message: resp.message,
        messageId: resp.messageId,
        context: resp.context
      })
    };
  }
  if (get(resp, 'isApiResponse') === true) {
    const headers = resp.headers;
    let body = resp.payload;
    const isJsonResponse = get(resp, 'isJsonResponse') === true;
    if (isJsonResponse) {
      body = JSON.stringify(body);
    }
    const isBinaryResponse = get(resp, 'isBinaryResponse') === true;
    if (isBinaryResponse) {
      body = body.toString('base64');
    }
    return {
      statusCode: resp.statusCode,
      body,
      ...(Object.keys(headers).length === 0 ? {} : { headers }),
      ...(isBinaryResponse ? { isBase64Encoded: true } : {})
    };
  }
  throw resp;
};
