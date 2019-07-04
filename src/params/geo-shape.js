const assert = require('assert');
const Joi = require('joi-strict');
const Json = require('./json');

class GeoShape extends Json {
  constructor(name, position, opts = {}) {
    const { maxPoints, clockwise, relaxed } = opts;
    let schema = Joi.array().items(Joi.array().ordered([
      Joi.number().min(-180).max(180),
      Joi.number().min(-90).max(90)
    ]));
    if (maxPoints !== undefined) {
      schema = schema.max(maxPoints);
    }
    super(name, position, Object.assign({}, opts, { schema }));
    assert(relaxed === undefined || typeof relaxed === 'boolean');
    this.clockwise = clockwise;
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'number' } };
    this.relaxed = relaxed === true;
  }

  static isDirectional(arr, clockwise) {
    let result = (arr[arr.length - 1][1] * arr[0][0]) - (arr[0][1] * arr[arr.length - 1][0]);
    for (let i = 0; i < arr.length - 1; i += 1) {
      result += (arr[i][1] * arr[i + 1][0]) - (arr[i + 1][1] * arr[i][0]);
    }
    return clockwise ? result > 0 : result < 0;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      // already validated by super
      valueParsed = JSON.parse(value);
    }
    // check direction
    if (valid && this.clockwise !== undefined && !GeoShape.isDirectional(valueParsed, this.clockwise)) {
      valid = false;
    }
    // ensure closed polygon
    if (valid && (
      valueParsed[0][0] !== valueParsed[valueParsed.length - 1][0]
      || valueParsed[0][1] !== valueParsed[valueParsed.length - 1][1])) {
      valid = false;
    }
    // ensure non-degenerate polygon
    if (valid && new Set(valueParsed.map(p => `${p[0]}${p[1]}`)).size !== valueParsed.length - 1) {
      valid = false;
    }
    if (valid && this.relaxed !== true && valueParsed.some(p => p[0] === 0 || p[1] === 0)) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    return super.get(event);
  }
}
module.exports = GeoShape;
