const assert = require('assert');

class Plugin {
  constructor(options) {
    assert(options instanceof Object && !Array.isArray(options));
    this.options = options;
  }

  // todo: schema validation

  static getOptionPath() {
    throw new Error('Not Implemented!');
  }

  // eslint-disable-next-line class-methods-use-this
  before({ event, context }) {}

  // eslint-disable-next-line class-methods-use-this
  after({
    event, context, result, success
  }) {}
}
module.exports.Plugin = Plugin;
