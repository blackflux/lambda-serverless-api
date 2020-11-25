const Int = require('./int');

class IntShort extends Int {
  constructor(name, position, opts = {}) {
    super(name, position, { ...opts, min: -32768, max: 32767 });
  }
}
module.exports = IntShort;
