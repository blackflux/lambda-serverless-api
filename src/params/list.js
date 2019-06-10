const assert = require('assert');
const Abstract = require('./_abstract');

class List extends Abstract {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.type = 'array';
    this.items = {
      allOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'integer' },
        { type: 'boolean' }
      ]
    };

    assert(opts.maxLength === undefined || Number.isInteger(opts.maxLength));
    this.maxLength = opts.maxLength;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      try {
        valueParsed = JSON.parse(value);
      } catch (e) {
        valid = false;
      }
    }
    if (valid && !Array.isArray(valueParsed)) {
      valid = false;
    }
    if (valid && this.maxLength !== undefined && valueParsed.length > this.maxLength) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? JSON.parse(result) : result;
  }
}
module.exports = List;
