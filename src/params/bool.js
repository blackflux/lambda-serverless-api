const Abstract = require('./_abstract');

class Bool extends Abstract {
  constructor(...args) {
    super(...args);
    this.type = 'boolean';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && this.stringInput ? !value.match(/^(0|1|true|false)$/) : typeof value !== 'boolean') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? ['1', 'true'].indexOf(result) !== -1 : result === true;
  }
}
module.exports = Bool;
