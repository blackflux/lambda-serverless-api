const List = require('./list');

class StrList extends List {
  constructor(...args) {
    super(...args);
    this.items = { type: 'string' };
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && (this.stringInput ? JSON.parse(value) : value).some(e => typeof e !== 'string')) {
      valid = false;
    }
    return valid;
  }
}
module.exports = StrList;
