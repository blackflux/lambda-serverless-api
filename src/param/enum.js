import assert from 'assert';
import Str from './str.js';

class Enum extends Str {
  constructor(name, position, opts) {
    super(name, position, opts);
    assert(opts.enums !== undefined, 'Enums are required.');
    assert(Array.isArray(opts.enums));
    assert(opts.enums.every((e) => typeof e === 'string'));
    this.enums = new Set(opts.enums);
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !this.enums.has(value)) {
      valid = false;
    }
    return valid;
  }
}
export default Enum;
