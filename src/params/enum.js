const assert = require('assert');
const Str = require('./str');

class Enum extends Str {
  constructor(name, position, enums, opts = {}) {
    super(name, position, opts);
    assert(enums !== undefined, 'enums are required');
    assert(Array.isArray(enums));
    assert(enums.every(e => typeof e === 'string'));
    this.enums = new Set(enums);
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !this.enums.has(value)) {
      valid = false;
    }
    return valid;
  }
}
module.exports = Enum;
