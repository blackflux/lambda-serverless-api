const Joi = require('joi-strict');
const Schema = require('./schema');

class IsoTimestamp extends Schema {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      schema: Joi.alternatives().match('all').try(
        Joi.date().iso(),
        Joi.string().regex(new RegExp([
          /(^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$)|/.source,
          /(^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)$)|/.source,
          /(^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)$)/.source
        ].join('')))
      )
    });
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && new Date(value).toISOString().split('T')[0] !== value.split('T')[0]) {
      valid = false;
    }
    return valid;
  }
}
module.exports = IsoTimestamp;
