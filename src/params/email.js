const RegEx = require('./regex');

class Email extends RegEx {
  constructor(name, ...args) {
    super(name, /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, ...args);
  }
}
module.exports = Email;
