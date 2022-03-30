import assert from 'assert';
import get from 'lodash.get';
import JsonList from './json-list.js';
import { genSchema } from '../util/geo-poly.js';

class GeoPolyList extends JsonList {
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
export default GeoPolyList;
