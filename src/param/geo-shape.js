const assert = require('assert');
const Joi = require('joi-strict');
const Json = require('./json');
const validateGeoShape = require('../util/validate-geo-shape');

const genSchema = ({ maxPoints, clockwise, relaxed }) => {
  assert(relaxed === undefined || typeof relaxed === 'boolean');
  let schema = Joi.array().items(Joi.array().ordered(
    Joi.number().min(-180).max(180),
    Joi.number().min(-90).max(90)
  )).custom((value, _) => {
    if (!validateGeoShape({
      geoShape: value,
      clockwise,
      relaxed: relaxed === true
    })) {
      throw new Error('Invalid GeoShape');
    }
    return value;
  });
  if (maxPoints !== undefined) {
    schema = schema.max(maxPoints);
  }
  return schema;
};

class GeoShape extends Json {
  constructor(name, position, opts = {}) {
    const schema = genSchema(opts);
    super(name, position, { ...opts, schema });
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'number' } };
  }

  get(event) {
    return super.get(event);
  }
}
module.exports = GeoShape;
