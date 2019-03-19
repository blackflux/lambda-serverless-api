const NumberList = require('./number-list');

class GeoRect extends NumberList {
  constructor(...args) {
    super(...args);
    this.minItems = 4;
    this.maxItems = 4;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid) {
      const valueParsed = (this.stringInput ? JSON.parse(value) : value);
      if (
        valueParsed.length !== 4
        // check bounds
        || valueParsed[0] < -180
        || valueParsed[0] > 180
        || valueParsed[1] < -90
        || valueParsed[1] > 90
        || valueParsed[2] < -180
        || valueParsed[2] > 180
        || valueParsed[3] < -90
        || valueParsed[3] > 90
        // check latitude (longitude always valid because rect covering anti-meridian valid in es)
        || valueParsed[1] < valueParsed[3]
      ) {
        valid = false;
      }
    }
    return valid;
  }
}
module.exports = GeoRect;
