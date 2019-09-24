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
  beforeRegister(kwargs) {}

  // eslint-disable-next-line class-methods-use-this
  afterRegister(kwargs) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled(kwargs) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before(kwargs) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after(kwargs) {}
}
module.exports.Plugin = Plugin;
