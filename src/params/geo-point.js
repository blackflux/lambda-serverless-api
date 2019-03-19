const NumberList = require('./number-list');

class GeoPoint extends NumberList {
  constructor(...args) {
    super(...args);
    this.minItems = 2;
    this.maxItems = 2;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid) {
      const valueParsed = (this.stringInput ? JSON.parse(value) : value);
      if (
        valueParsed.length !== 2
        || valueParsed[0] < -180
        || valueParsed[0] > 180
        || valueParsed[1] < -90
        || valueParsed[1] > 90
      ) {
        valid = false;
      }
    }
    return valid;
  }
}
module.exports = GeoPoint;
