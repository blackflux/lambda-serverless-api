const assert = require('assert');
const get = require('lodash.get');
const Abstract = require('./_abstract');
const escapeRegExp = require('../util/escape-reg-exp');

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
  '%',
  '_',
  '-',
  '--',
  'NUL',
  '[object Object]'
];

class Str extends Abstract {
  constructor(name, position, opts) {
    super(name, position, opts);
    this.type = 'string';
    this.relaxed = get(opts, 'relaxed', false);
    assert(typeof this.relaxed === 'boolean');
    if (this.relaxed !== true) {
      this.regex = new RegExp(`!?^(${rejectedStrings.map((s) => escapeRegExp(s)).join('|')})$`);
    }
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !(typeof value === 'string' || value instanceof String)) {
      valid = false;
    }
    if (valid && this.relaxed !== true && rejectedStrings.includes(value)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = Str;
