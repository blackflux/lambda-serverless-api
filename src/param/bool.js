import Abstract from './_abstract.js';

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

  get(value) {
    const result = super.get(value);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? ['1', 'true'].indexOf(result) !== -1 : result === true;
  }
}
export default Bool;
