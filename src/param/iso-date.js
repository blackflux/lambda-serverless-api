const Joi = require('joi-strict');
const Schema = require('./schema');

class IsoDate extends Schema {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      schema: Joi.alternatives().match('all').try(
        Joi.date().iso(),
        Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      )
    });
    this.nullAsInfinity = opts?.nullAsInfinity;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && new Date(value).toISOString().split('T')[0] !== value) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if (this.nullAsInfinity && result === null) {
      return '9999-01-01';
    }
    return result;
  }
}
module.exports = IsoDate;
