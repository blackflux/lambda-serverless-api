const assert = require('assert');
const Joi = require('joi-strict');
const Str = require('./str');

class Schema extends Str {
  constructor(name, position, opts) {
    super(name, position, opts);
    const { schema } = opts;
    assert(Joi.isSchema(schema), 'Joi Schema required');
    this.schema = schema;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !Joi.test(value, this.schema)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = Schema;
