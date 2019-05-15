const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi-strict');
const Abstract = require('./_abstract');

class Json extends Abstract {
  constructor(name, position, opts) {
    super(name, position, opts);
    const { schema } = opts;
    assert(get(schema, 'isJoi') === true, 'Joi Schema required');
    this.type = this.stringInput ? 'string' : 'object';
    this.schema = schema;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      try {
        valueParsed = JSON.parse(value);
      } catch (e) {
        valid = false;
      }
    }
    if (valid && Joi.validate(valueParsed, this.schema).error !== null) {
      valid = false;
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
module.exports = Json;
