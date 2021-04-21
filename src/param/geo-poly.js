const assert = require('assert');
const get = require('lodash.get');
const Json = require('./json');
const { genSchema } = require('../util/geo-poly');

class GeoPoly extends Json {
  constructor(name, position, opts = {}) {
    const { maxHoles } = opts;
    assert(maxHoles === undefined || Number.isInteger(maxHoles));
    const schema = genSchema({
      maxPoints: opts.maxPoints,
      relaxed: opts.relaxed,
      maxHoles: opts.maxHoles,
      maxPointsPerimeter: opts.maxPointsPerimeter,
      maxPointsPerHole: opts.maxPointsPerHole,
      maxPrecision: get(opts, 'maxPrecision', 5)
    });
    super(name, position, { ...opts, schema });
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'array' } };
  }
}
module.exports = GeoPoly;
