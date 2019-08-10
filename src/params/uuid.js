const RegEx = require('./regex');

class UUID extends RegEx {
  constructor(name, position, opts) {
    super(name, position, { ...opts, regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ });
  }
}
module.exports = UUID;
