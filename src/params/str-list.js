const assert = require('assert');
const List = require('./list');

class StrList extends List {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.items = { type: 'string' };
    if (opts.enums !== undefined) {
      assert(Array.isArray(opts.enums));
      assert(opts.enums.every(e => typeof e === 'string'));
      this.enums = new Set(opts.enums);
    }
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && valueParsed.some(e => typeof e !== 'string')) {
      valid = false;
    }
    if (valid && this.enums !== undefined && !valueParsed.every(val => this.enums.has(val))) {
      valid = false;
    }
    return valid;
  }
}
module.exports = StrList;
