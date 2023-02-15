import assert from 'assert';
import get from 'lodash.get';
import Abstract from './_abstract.js';
import {
  regex as rejectedStringsRegex,
  list as rejectedStringsList
} from '../resources/rejected-strings.js';

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
      this.regex = rejectedStringsRegex;
    }
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !(typeof value === 'string' || value instanceof String)) {
      valid = false;
    }
    if (valid && this.relaxed !== true && rejectedStringsList.includes(value)) {
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
