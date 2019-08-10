const moment = require('moment');
const RegEx = require('./regex');

class Date extends RegEx {
  constructor(name, position, opts) {
    super(name, position, { ...opts, regex: new RegExp(/^\d{4}-\d{2}-\d{2}$/) });
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !moment(value).isValid()) {
      valid = false;
    }
    return valid;
  }
}

module.exports = Date;
