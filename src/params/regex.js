const Str = require('./str');

class RegEx extends Str {
  constructor(name, regex, ...args) {
    super(name, ...args);
    this.regex = regex;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !value.match(this.regex)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = RegEx;
