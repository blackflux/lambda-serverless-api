const Joi = require('joi-strict');
const { genSchema: genSchemaGeoShape } = require('./geo-shape');

module.exports.genSchema = ({
  maxPoints, relaxed, maxHoles, maxPointsPerimeter, maxPointsPerHole
}) => {
  const perimeterSchema = genSchemaGeoShape({
    maxPoints: maxPointsPerimeter,
    clockwise: false,
    relaxed
  });
  const holesSchema = genSchemaGeoShape({
    maxPoints: maxPointsPerHole,
    clockwise: true,
    relaxed
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
