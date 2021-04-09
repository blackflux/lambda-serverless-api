const polygon = require('turf-polygon');
const kinks = require('@turf/kinks').default;

const isDirectional = (arr, clockwise) => {
  let result = (arr[arr.length - 1][1] * arr[0][0]) - (arr[0][1] * arr[arr.length - 1][0]);
  for (let i = 0; i < arr.length - 1; i += 1) {
    result += (arr[i][1] * arr[i + 1][0]) - (arr[i + 1][1] * arr[i][0]);
  }
  return clockwise ? result > 0 : result < 0;
};

module.exports = ({ geoShape, clockwise, relaxed }) => {
  // check direction
  if (clockwise !== undefined && !isDirectional(geoShape, clockwise)) {
    return false;
  }
  // ensure closed polygon
  if (
    geoShape[0][0] !== geoShape[geoShape.length - 1][0]
    || geoShape[0][1] !== geoShape[geoShape.length - 1][1]) {
    return false;
  }
  if (relaxed !== true && geoShape.some((p) => p[0] === 0 || p[1] === 0)) {
    return false;
  }
  // check for self intersections
  if (kinks(polygon([geoShape])).features.length !== 0) {
    return false;
  }
  return true;
};
