const moment = require('moment');
const RegEx = require('./regex');

class IsoDate extends RegEx {
  constructor(name, position, opts) {
    super(name, position, {
      ...opts,
      regex: new RegExp(
        /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|/.source
        + /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|/.source
        + /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/.source
      )
    });
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !moment(value).isValid()) {
      valid = false;
    }
    return valid;
  }
}
module.exports = IsoDate;
