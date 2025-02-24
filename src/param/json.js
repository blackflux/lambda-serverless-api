import assert from 'assert';
import Joi from 'joi-strict';
import Abstract from './_abstract.js';

class Json extends Abstract {
  constructor(name, position, opts) {
    super(name, position, opts);
    const { schema } = opts;
    assert(Joi.isSchema(schema), 'Joi Schema required');
    this.type = this.stringInput ? 'string' : 'object';
    this.schema = schema;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      try {
        valueParsed = JSON.parse(value);
      } catch {
        valid = false;
      }
    }
    if (valid) {
      const { error } = this.schema.validate(valueParsed);
      if (error !== undefined) {
        throw error;
      }
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? JSON.parse(result) : result;
  }
}
export default Json;
