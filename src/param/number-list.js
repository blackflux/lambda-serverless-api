import assert from 'assert';
import List from './list.js';

class NumberList extends List {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.items = { type: 'number' };

    assert(opts.minItemValue === undefined || typeof opts.minItemValue === 'number');
    this.minItemValue = opts.minItemValue;

    assert(opts.maxItemValue === undefined || typeof opts.maxItemValue === 'number');
    this.maxItemValue = opts.maxItemValue;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && valueParsed.some((e) => typeof e !== 'number')) {
      valid = false;
    }
    if (valid && this.minItemValue !== undefined && valueParsed.some((e) => e < this.minItemValue)) {
      valid = false;
    }
    if (valid && this.maxItemValue !== undefined && valueParsed.some((e) => e > this.maxItemValue)) {
      valid = false;
    }
    return valid;
  }
}
export default NumberList;
