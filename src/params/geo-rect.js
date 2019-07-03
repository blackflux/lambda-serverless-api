const assert = require('assert');
const get = require('lodash.get');
const NumberList = require('./number-list');

class GeoRect extends NumberList {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.minItems = 4;
    this.maxItems = 4;
    assert(opts.relaxed === undefined || typeof opts.relaxed === 'boolean');
    this.relaxed = get(opts, 'relaxed', false);
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
      if (valid && this.relaxed === false && valueParsed.some(p => p === 0)) {
        valid = false;
      }
    }
    return valid;
  }
}
module.exports = GeoRect;
