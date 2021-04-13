const JsonList = require('./json-list');
const { genSchema } = require('../util/geo-shape');

class GeoShapeList extends JsonList {
  constructor(name, position, opts = {}) {
    const schema = genSchema(opts);
    super(name, position, { schema, ...opts });
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'array' } };
  }
}

module.exports = GeoShapeList;
