const assert = require('assert');
const Str = require('./str');
const escapeRegExp = require('../util/escape-reg-exp');

class Enum extends Str {
  constructor(name, position, enums, opts = {}) {
    super(name, position, opts);
    assert(enums !== undefined, 'Enums are required.');
    assert(Array.isArray(enums));
    assert(enums.every(e => typeof e === 'string'));
    this.enums = new Set(enums);
    this.regex = new RegExp(`^(${enums.map(s => escapeRegExp(s)).join('|')})$`);
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
