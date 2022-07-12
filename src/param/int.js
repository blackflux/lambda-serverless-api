import assert from 'assert';
import Abstract from './_abstract.js';

class Int extends Abstract {
  constructor(name, position, opts = {}) {
    super(name, position, opts);
    this.type = 'integer';

    assert(opts.min === undefined || Number.isInteger(opts.min));
    this.min = opts.min;

    assert(opts.max === undefined || Number.isInteger(opts.max));
    this.max = opts.max;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && this.stringInput ? !value.match(/^(-?[1-9]+\d*)$|^0$/) : typeof value !== 'number') {
      valid = false;
    }
    if (valid && this.max !== undefined && value > this.max) {
      valid = false;
    }
    if (valid && this.min !== undefined && value < this.min) {
      valid = false;
    }
    return valid;
  }

  get(value) {
    const result = super.get(value);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? Number(result) : result;
  }
}
export default Int;
