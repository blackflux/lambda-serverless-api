const Str = require('./str');

const rejectedStrings = [
  '',
  'undefined',
  'undef',
  'null',
  'NULL',
  '(null)',
  'nil',
  'NIL',
  'true',
  'false',
  'True',
  'False',
  'TRUE',
  'FALSE',
  'None',
  'NaN',
  'Infinity',
  '-Infinity',
  '"',
  '\'',
  '""',
  '\'\'',
  ' ',
  '_',
  '-',
  'NUL'
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
