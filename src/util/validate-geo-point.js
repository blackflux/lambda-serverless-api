module.exports = (geoPoint) => Array.isArray(geoPoint)
  && geoPoint.length === 2
  && Math.abs(geoPoint[0]) <= 180
  && Math.abs(geoPoint[1]) <= 90;
