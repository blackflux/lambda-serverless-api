const assert = require('assert');
const Joi = require('joi-strict');
const List = require('./list');

class JsonList extends List {
  constructor(name, position, opts) {
    super(name, position, opts);
    const { schema } = opts;
    assert(Joi.isSchema(schema), 'Joi Schema required');
    this.schema = schema;
    this.items = { type: 'array', items: { type: 'object' } };
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && valueParsed.some((e) => !Joi.test(e, this.schema))) {
      valid = false;
    }
    return valid;
  }
}
module.exports = JsonList;
