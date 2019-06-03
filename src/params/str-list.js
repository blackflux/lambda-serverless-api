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
    if (opts.minListItemLength !== undefined) {
      assert(typeof opts.minListItemLength === 'number');
      this.minListItemLength = opts.minListItemLength;
    }
    if (opts.maxListItemLength !== undefined) {
      assert(typeof opts.maxListItemLength === 'number');
      this.maxListItemLength = opts.maxListItemLength;
    }
    if (opts.maxListLength !== undefined) {
      assert(typeof opts.maxListLength === 'number');
      this.maxListLength = opts.maxListLength;
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
    if (valid && this.maxListLength !== undefined && valueParsed.length > this.maxListLength) {
      valid = false;
    }
    if (valid && this.minListItemLength !== undefined && valueParsed.some(e => e.length < this.minListItemLength)) {
      valid = false;
    }
    if (valid && this.maxListItemLength !== undefined && valueParsed.some(e => e.length > this.maxListItemLength)) {
      valid = false;
    }
    if (valid && this.enums !== undefined && !valueParsed.every(val => this.enums.has(val))) {
      valid = false;
    }
    return valid;
  }
}
module.exports = StrList;
