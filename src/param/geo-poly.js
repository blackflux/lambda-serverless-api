const assert = require('assert');
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
      maxPointsTotal: opts.maxPointsTotal,
      maxPointsPerShape: opts.maxPointsPerShape,
      maxPointsPerHole: opts.maxPointsPerHole
    });
    super(name, position, { ...opts, schema });
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'array' } };
  }
}
module.exports = GeoPoly;
