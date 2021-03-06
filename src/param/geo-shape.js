const get = require('lodash.get');
const Json = require('./json');
const { genSchema } = require('../util/geo-shape');

class GeoShape extends Json {
  constructor(name, position, opts = {}) {
    const schema = genSchema({
      maxPoints: opts.maxPoints,
      clockwise: opts.clockwise,
      relaxed: opts.relaxed,
      maxPrecision: get(opts, 'maxPrecision', 5)
    });
    super(name, position, { ...opts, schema });
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'number' } };
  }

  get(event) {
    return super.get(event);
  }
}
module.exports = GeoShape;
