const Str = require('./str');

const rejectedStrings = [
  '',
  'undefined',
  'undef',
  'null',
  'NULL'
];

class Strinct extends Str {
  constructor(...args) {
    super(...args);
    this.regex = new RegExp(`^(${rejectedStrings.join('|')})$`);
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && rejectedStrings.includes(value)) {
      valid = false;
    }
    return valid;
  }
}

module.exports = Strinct;
