const Abstract = require('./_abstract');

class Str extends Abstract {
  constructor(...args) {
    super(...args);
    this.type = 'string';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !(typeof value === 'string' || value instanceof String)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = Str;
