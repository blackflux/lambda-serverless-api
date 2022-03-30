import assert from 'assert';
import Joi from 'joi-strict';
import Str from './str.js';

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
export default Schema;
