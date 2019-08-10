const List = require('./list');

class NumberList extends List {
  constructor(...args) {
    super(...args);
    this.items = { type: 'number' };
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && (this.stringInput ? JSON.parse(value) : value).some((e) => typeof e !== 'number')) {
      valid = false;
    }
    return valid;
  }
}
module.exports = NumberList;
