import assert from 'assert';
import get from 'lodash.get';
import Joi from 'joi-strict';
import NumberList from './number-list.js';
import { genSchema as genSchemaGeoPoint } from '../util/geo-point.js';

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
export default GeoPoint;
