const assert = require('assert');
const get = require('lodash.get');
const NumberList = require('./number-list');

class GeoPoint extends NumberList {
  constructor(name, position, opts = {}) {
    assert(opts.relaxed === undefined || typeof opts.relaxed === 'boolean');
    super(name, position, opts);
    this.minItems = 2;
    this.maxItems = 2;
    this.relaxed = get(opts, 'relaxed', false);
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
      if (valid && this.relaxed === false && (valueParsed[0] === 0 || valueParsed[1] === 0)) {
        valid = false;
      }
    }
    return valid;
  }
}
module.exports = GeoPoint;
