import assert from 'assert';
import Joi from 'joi-strict';
import validateGeoShape from './validate-geo-shape.js';
import { genSchema as genSchemaGeoPoint } from './geo-point.js';

export const genSchema = ({
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
