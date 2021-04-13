const Joi = require('joi-strict');
const { genSchema: genSchemaGeoShape } = require('./geo-shape');

module.exports.genSchema = ({
  maxPoints, relaxed, maxHoles, maxPointsTotal, maxPointsPerShape, maxPointsPerHole
}) => {
  const perimeterSchema = genSchemaGeoShape({
    maxPoints,
    clockwise: false,
    relaxed
  });
  const holesSchema = genSchemaGeoShape({
    maxPoints,
    clockwise: true,
    relaxed
  });
  return Joi.array()
    .ordered(perimeterSchema)
    .items(holesSchema)
    .custom((value, _) => {
      if (maxHoles !== undefined && value.slice(1).length > maxHoles) {
        throw new Error('Invalid number of polygon holes');
      }
      if (maxPointsTotal !== undefined && value.reduce((prev, cur) => prev + cur.length, 0) > maxPointsTotal) {
        throw new Error('Invalid max geo points total');
      }
      if (maxPointsPerShape !== undefined && value[0].length > maxPointsPerShape) {
        throw new Error('Invalid max geo points for shape');
      }
      if (maxPointsPerHole !== undefined && value.slice(1).some((holes) => holes.length > maxPointsPerHole)) {
        throw new Error('Invalid max geo points for holes');
      }
      return value;
    });
};
