const assert = require('assert');
const Joi = require('joi-strict');
const Json = require('./json');
const validateGeoShape = require('../util/validate-geo-shape');

class GeoShape extends Json {
  constructor(name, position, opts = {}) {
    const { maxPoints, clockwise, relaxed } = opts;
    let schema = Joi.array().items(Joi.array().ordered(
      Joi.number().min(-180).max(180),
      Joi.number().min(-90).max(90)
    ));
    if (maxPoints !== undefined) {
      schema = schema.max(maxPoints);
    }
    super(name, position, { ...opts, schema });
    assert(relaxed === undefined || typeof relaxed === 'boolean');
    this.clockwise = clockwise;
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'number' } };
    this.relaxed = relaxed === true;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      // already validated by super
      valueParsed = JSON.parse(value);
    }
    if (
      valid
      && !validateGeoShape({
        geoShape: valueParsed,
        clockwise: this.clockwise,
        relaxed: this.relaxed
      })
    ) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    return super.get(event);
  }
}
module.exports = GeoShape;
