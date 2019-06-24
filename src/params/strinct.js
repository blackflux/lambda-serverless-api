const Str = require('./str');

const escapeRegExp = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

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
  'INF',
  '"',
  '\'',
  '""',
  '\'\'',
  ' ',
  '%',
  '_',
  '-',
  '--',
  'NUL'
];

class Strinct extends Str {
  constructor(...args) {
    super(...args);
    this.regex = new RegExp(`!?^(${rejectedStrings.map(s => escapeRegExp(s)).join('|')})$`);
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
