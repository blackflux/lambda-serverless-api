import Joi from 'joi-strict';
import Schema from './schema.js';

class IsoDate extends Schema {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      schema: Joi.alternatives().match('all').try(
        Joi.date().iso(),
        Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      )
    });
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && new Date(value).toISOString().split('T')[0] !== value) {
      valid = false;
    }
    return valid;
  }
}
export default IsoDate;
