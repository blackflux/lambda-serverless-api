import assert from 'assert';
import get from 'lodash.get';
import Json from './json.js';
import { genSchema } from '../util/geo-poly.js';

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
export default GeoPoly;
