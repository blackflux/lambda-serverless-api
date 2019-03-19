const RegEx = require('./regex');

class UUID extends RegEx {
  constructor(name, position, opts) {
    super(name, position, Object.assign({
      regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    }, opts));
  }
}
module.exports = UUID;
