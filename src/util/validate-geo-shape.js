const polygon = require('turf-polygon');
const kinks = require('@turf/kinks').default;

const isDirectional = (arr, clockwise) => {
  let result = (arr[arr.length - 1][1] * arr[0][0]) - (arr[0][1] * arr[arr.length - 1][0]);
  for (let i = 0; i < arr.length - 1; i += 1) {
    result += (arr[i][1] * arr[i + 1][0]) - (arr[i + 1][1] * arr[i][0]);
  }
  return clockwise ? result > 0 : result < 0;
};

module.exports = ({ valueParsed, clockwise, relaxed }) => {
  // check direction
  if (clockwise !== undefined && !isDirectional(valueParsed, clockwise)) {
    return false;
  }
  // ensure closed polygon
  if (
    valueParsed[0][0] !== valueParsed[valueParsed.length - 1][0]
    || valueParsed[0][1] !== valueParsed[valueParsed.length - 1][1]) {
    return false;
  }
  // ensure non-degenerate polygon
  if (new Set(valueParsed.map((p) => `${p[0]}${p[1]}`)).size !== valueParsed.length - 1) {
    return false;
  }
  if (relaxed !== true && valueParsed.some((p) => p[0] === 0 || p[1] === 0)) {
    return false;
  }
  // check for self intersections
  if (kinks(polygon([valueParsed])).features.length !== 0) {
    return false;
  }
  return true;
};
