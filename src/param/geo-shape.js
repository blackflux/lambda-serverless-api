import get from 'lodash.get';
import Json from './json.js';
import { genSchema } from '../util/geo-shape.js';

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

  get(value) {
    return super.get(value);
  }
}
export default GeoShape;
