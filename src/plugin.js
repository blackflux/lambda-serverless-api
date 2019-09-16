const assert = require('assert');

class Plugin {
  constructor(options) {
    if (new.target === Plugin) {
      throw new TypeError(`Class "${new.target.name}" is abstract`);
    }
    assert(options instanceof Object && !Array.isArray(options));
    this.options = options;
  }

  static schema() {
    throw new Error('Not Implemented!');
  }

  static weight() {
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
