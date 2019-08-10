const { ApiResponseClass } = require('./api-response');

class JsonResponse extends ApiResponseClass {
  constructor(...args) {
    super(...args);
    this.isJsonResponse = true;
  }
}
module.exports.JsonResponseClass = JsonResponse;
module.exports.JsonResponse = (...args) => new JsonResponse(...args);
