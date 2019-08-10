const Joi = require('joi-strict');
const Json = require('./json');

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
    let valid = super.validate(value);
    if (valid && !this.stringInput && typeof value !== 'number') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    return super.get(event);
  }
}
module.exports = NumberParam;
