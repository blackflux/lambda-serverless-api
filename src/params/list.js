const Abstract = require('./_abstract');

class List extends Abstract {
  constructor(...args) {
    super(...args);
    this.type = 'array';
    this.items = {
      allOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'integer' },
        { type: 'boolean' }
      ]
    };
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
