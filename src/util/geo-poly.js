import Joi from 'joi-strict';
import { genSchema as genSchemaGeoShape } from './geo-shape.js';

export const genSchema = ({
  maxPoints, relaxed, maxHoles, maxPointsPerimeter, maxPointsPerHole, maxPrecision
}) => {
  const perimeterSchema = genSchemaGeoShape({
    maxPoints: maxPointsPerimeter,
    clockwise: false,
    relaxed,
    maxPrecision
  });
  const holesSchema = genSchemaGeoShape({
    maxPoints: maxPointsPerHole,
    clockwise: true,
    relaxed,
    maxPrecision
  });
  return Joi.array()
    .ordered(perimeterSchema)
    .items(holesSchema)
    .custom((value, _) => {
      if (maxHoles !== undefined && value.slice(1).length > maxHoles) {
        throw new Error('Total number of polygon holes exceeded');
      }
      if (maxPoints !== undefined && value.reduce((prev, cur) => prev + cur.length, 0) > maxPoints) {
        throw new Error('Total number of geo points exceeded');
      }
      return value;
    });
};
