const RegEx = require('./regex');

class UUID extends RegEx {
  constructor(name, ...args) {
    super(name, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, ...args);
  }
}
module.exports = UUID;
