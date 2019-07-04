const assert = require('assert');
const get = require('lodash.get');
const NumberList = require('./number-list');

class GeoPoint extends NumberList {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    assert(opts.relaxed === undefined || typeof opts.relaxed === 'boolean');
    this.minItems = 2;
    this.maxItems = 2;
    this.relaxed = get(opts, 'relaxed', false);
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && (
      valueParsed.length !== 2
      || valueParsed[0] < -180
      || valueParsed[0] > 180
      || valueParsed[1] < -90
      || valueParsed[1] > 90
    )) {
      valid = false;
    }
    if (valid && this.relaxed !== true && (valueParsed[0] === 0 || valueParsed[1] === 0)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = GeoPoint;
