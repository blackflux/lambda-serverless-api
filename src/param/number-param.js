import Joi from 'joi-strict';
import Json from './json.js';

class NumberParam extends Json {
  constructor(name, position, opts = {}) {
    const { min, max } = opts;
    let schema = Joi.number();
    if (min !== undefined) {
      schema = schema.min(min);
    }
    if (max !== undefined) {
      schema = schema.max(max);
    }
    super(name, position, { ...opts, schema });
    this.type = 'number';
  }

  validate(value) {
    return super.validate(value);
  }

  get(event) {
    return super.get(event);
  }
}
export default NumberParam;
