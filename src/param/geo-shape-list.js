const JsonList = require('./json-list');
const { genSchema } = require('../util/geo-shape');

class GeoShapeList extends JsonList {
  constructor(name, position, opts = {}) {
    const schema = genSchema({
      maxPoints: opts.maxPoints,
      clockwise: opts.clockwise,
      relaxed: opts.relaxed
    });
    super(name, position, { schema, ...opts });
    this.items = { type: 'array', items: { type: 'array' } };
  }
}

module.exports = GeoShapeList;
