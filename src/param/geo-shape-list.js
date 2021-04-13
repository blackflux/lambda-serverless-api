const assert = require('assert');
const List = require('./list');
const validateGeoShape = require('../util/validate-geo-shape');
const validateGeoPoint = require('../util/validate-geo-point');

class GeoShapeList extends List {
  constructor(name, position, opts = {}) {
    const { maxPoints, clockwise, relaxed } = opts;
    super(name, position, opts);
    assert(clockwise === undefined || typeof clockwise === 'boolean');
    assert(relaxed === undefined || typeof relaxed === 'boolean');
    assert(maxPoints === undefined || Number.isInteger(maxPoints));
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'array' } };
    this.clockwise = clockwise;
    this.relaxed = relaxed === true;
    this.maxPoints = maxPoints;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      // already validated by super
      valueParsed = JSON.parse(value);
    }
    if (
      valid
      && this.maxPoints !== undefined
      && valueParsed.some((geoShape) => geoShape.length > this.maxPoints)
    ) {
      valid = false;
    }
    if (
      valid
      && !valueParsed.every((geoShape) => geoShape.every((point) => validateGeoPoint(point)))
    ) {
      valid = false;
    }
    if (
      valid
      && !valueParsed.every((geoShape) => validateGeoShape({
        geoShape,
        clockwise: this.clockwise,
        relaxed: this.relaxed
      }))
    ) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    return super.get(event);
  }
}

module.exports = GeoShapeList;
