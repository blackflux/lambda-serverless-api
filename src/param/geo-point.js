const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi-strict');
const NumberList = require('./number-list');
const { genSchema: genSchemaGeoPoint } = require('../util/geo-point');

class GeoPoint extends NumberList {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    assert(opts.relaxed === undefined || typeof opts.relaxed === 'boolean');
    this.minItems = 2;
    this.maxItems = 2;
    this.relaxed = get(opts, 'relaxed', false);
    this.schema = genSchemaGeoPoint({ maxPrecision: get(opts, 'maxPrecision', 5) });
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && !Joi.test(valueParsed, this.schema)) {
      valid = false;
    }
    if (valid && this.relaxed !== true && (valueParsed[0] === 0 || valueParsed[1] === 0)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = GeoPoint;
