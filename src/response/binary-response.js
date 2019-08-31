const { ApiResponseClass } = require('./api-response');

class BinaryResponse extends ApiResponseClass {
  constructor(...args) {
    super(...args);
    this.isBinaryResponse = true;
  }
}
module.exports.BinaryResponseClass = BinaryResponse;
module.exports.BinaryResponse = (...args) => new BinaryResponse(...args);
