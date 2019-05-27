const assert = require('assert');
const List = require('./list');

class StrList extends List {
  constructor(name, position, opts) {
    super(name, position, opts);
    this.items = { type: 'string' };
    if (opts !== undefined && opts.enums) {
      assert(Array.isArray(opts.enums));
      this.enums = new Set(opts.enums);
    }
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid) {
      const strList = this.stringInput ? JSON.parse(value) : value;
      if (strList.some(e => typeof e !== 'string')) {
        valid = false;
      }
      if (this.enums !== undefined && !strList.every(val => this.enums.has(val))) {
        valid = false;
      }
    }

    return valid;
  }
}
module.exports = StrList;
