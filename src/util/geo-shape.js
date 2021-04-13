const assert = require('assert');
const Joi = require('joi-strict');
const validateGeoShape = require('./validate-geo-shape');

module.exports.genSchema = ({ maxPoints, clockwise, relaxed }) => {
  assert(relaxed === undefined || typeof relaxed === 'boolean');
  const schema = Joi.array().items(Joi.array().ordered(
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
  return maxPoints === undefined ? schema : schema.max(maxPoints);
};
