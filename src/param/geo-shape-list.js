import get from 'lodash.get';
import JsonList from './json-list.js';
import { genSchema } from '../util/geo-shape.js';

class GeoShapeList extends JsonList {
  constructor(name, position, opts = {}) {
    const schema = genSchema({
      maxPoints: opts.maxPoints,
      clockwise: opts.clockwise,
      relaxed: opts.relaxed,
      maxPrecision: get(opts, 'maxPrecision', 5)
    });
    super(name, position, { schema, ...opts });
    this.items = { type: 'array', items: { type: 'array' } };
  }
}

export default GeoShapeList;
