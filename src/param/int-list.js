import assert from 'assert';
import NumberList from './number-list.js';

class IntList extends NumberList {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.items = { type: 'integer' };

    assert(opts.minItemValue === undefined || Number.isInteger(opts.minItemValue));
    this.minItemValue = opts.minItemValue;

    assert(opts.maxItemValue === undefined || Number.isInteger(opts.maxItemValue));
    this.maxItemValue = opts.maxItemValue;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      valueParsed = JSON.parse(value);
    }
    if (valid && valueParsed.some((e) => !Number.isInteger(e))) {
      valid = false;
    }
    return valid;
  }
}
export default IntList;
