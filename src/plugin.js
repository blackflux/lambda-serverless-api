const assert = require('assert');

class Plugin {
  constructor(options) {
    assert(options instanceof Object && !Array.isArray(options));
    this.options = options;
  }

  static schema() {
    throw new Error('Not Implemented!');
  }

  // eslint-disable-next-line class-methods-use-this
  async before(kwargs) {
    throw new Error('Not Implemented!');
  }

  // eslint-disable-next-line class-methods-use-this
  async after(kwargs) {
    throw new Error('Not Implemented!');
  }
}
module.exports.Plugin = Plugin;
