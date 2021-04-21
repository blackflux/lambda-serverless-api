const assert = require('assert');
const Joi = require('joi-strict');
const validateGeoShape = require('./validate-geo-shape');
const { genSchema: genSchemaGeoPoint } = require('./geo-point');

module.exports.genSchema = ({
  maxPoints, clockwise, relaxed, maxPrecision
}) => {
  assert(relaxed === undefined || typeof relaxed === 'boolean');
  const schema = Joi.array().items(genSchemaGeoPoint({ maxPrecision })).custom((value, _) => {
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
