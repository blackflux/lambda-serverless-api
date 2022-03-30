import assert from 'assert';
import get from 'lodash.get';
import Abstract from './_abstract.js';
import escapeRegExp from '../util/escape-reg-exp.js';

const rejectedStrings = [
  '',
  'undefined',
  'undef',
  'null',
  'NULL',
  '(null)',
  '<null>',
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
    this.minLength = get(opts, 'minLength', null);
    this.maxLength = get(opts, 'maxLength', null);
    assert(typeof this.relaxed === 'boolean');
    assert(this.minLength === null || Number.isInteger(this.minLength));
    assert(this.maxLength === null || Number.isInteger(this.maxLength));
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
    if (valid && this.minLength !== null && value.length < this.minLength) {
      valid = false;
    }
    if (valid && this.maxLength !== null && value.length > this.maxLength) {
      valid = false;
    }
    return valid;
  }
}
export default Str;
