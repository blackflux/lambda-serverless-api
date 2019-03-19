const Param = require('./_abstract');

class Int extends Param {
  constructor(...args) {
    super(...args);
    this.type = 'integer';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && this.stringInput ? !value.match(/^(-?[1-9]+\d*)$|^0$/) : typeof value !== 'number') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? Number(result) : result;
  }
}
module.exports = Int;
