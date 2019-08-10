const assert = require('assert');
const List = require('./list');

class StrList extends List {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.items = { type: 'string' };
    if (opts.enums !== undefined) {
      assert(Array.isArray(opts.enums));
      assert(opts.enums.every((e) => typeof e === 'string'));
      this.enums = new Set(opts.enums);
    }

    assert(opts.minItemLength === undefined || Number.isInteger(opts.minItemLength));
    this.minItemLength = opts.minItemLength;

    assert(opts.maxItemLength === undefined || Number.isInteger(opts.maxItemLength));
    this.maxItemLength = opts.maxItemLength;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && valueParsed.some((e) => typeof e !== 'string')) {
      valid = false;
    }
    if (valid && this.minItemLength !== undefined && valueParsed.some((e) => e.length < this.minItemLength)) {
      valid = false;
    }
    if (valid && this.maxItemLength !== undefined && valueParsed.some((e) => e.length > this.maxItemLength)) {
      valid = false;
    }
    if (valid && this.enums !== undefined && !valueParsed.every((val) => this.enums.has(val))) {
      valid = false;
    }
    return valid;
  }
}
module.exports = StrList;
