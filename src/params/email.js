const RegEx = require('./regex');

class Email extends RegEx {
  constructor(name, position, opts) {
    super(name, position, { ...opts, regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ });
  }
}
module.exports = Email;
