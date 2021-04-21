const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi-strict');
const NumberList = require('./number-list');
const { genSchema: genSchemaGeoPoint } = require('../util/geo-point');

class GeoRect extends NumberList {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    assert(opts.relaxed === undefined || typeof opts.relaxed === 'boolean');
    this.minItems = 4;
    this.maxItems = 4;
    this.relaxed = get(opts, 'relaxed', false);
    this.schema = genSchemaGeoPoint({ maxPrecision: get(opts, 'maxPrecision', 5) });
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && (
      valueParsed.length !== 4
      // check bounds
      || !Joi.test([valueParsed[0], valueParsed[1]], this.schema)
      || !Joi.test([valueParsed[2], valueParsed[3]], this.schema)
      // check latitude (longitude always valid because rect covering anti-meridian valid in es)
      || valueParsed[1] < valueParsed[3]
    )) {
      valid = false;
    }
    if (valid && this.relaxed !== true && valueParsed.some((p) => p === 0)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = GeoRect;
