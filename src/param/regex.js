import assert from 'assert';
import Str from './str.js';

class RegEx extends Str {
  constructor(name, position, opts) {
    super(name, position, opts);
    assert(opts.regex instanceof RegExp, 'Invalid Regex Option');
    this.regex = opts.regex;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !value.match(this.regex)) {
      valid = false;
    }
    return valid;
  }
}
export default RegEx;
