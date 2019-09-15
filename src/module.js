const fs = require('fs');
const path = require('path');
const get = require('lodash.get');

class Module {
  constructor(pluginPath, options) {
    this.plugins = fs
      .readdirSync(pluginPath)
      // eslint-disable-next-line import/no-dynamic-require,global-require
      .map((plugin) => require(path.join(pluginPath, plugin)))
      .map((P) => new P(get(options, P.getOptionPath(), {})));
  }

  before({ event }) {
    this.plugins.forEach((plugin) => {
      plugin.before({ event });
    });
  }

  // todo: change result to response
  after({ event, result, success }) {
    this.plugins.forEach((plugin) => {
      plugin.after({ event, result, success });
    });
  }
}
module.exports.Module = Module;
