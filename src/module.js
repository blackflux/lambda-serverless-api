const assert = require('assert');
const fs = require('fs');
const path = require('path');
const get = require('lodash.get');

class Module {
  constructor(pluginPath, options) {
    const plugins = fs
      .readdirSync(pluginPath)
      // eslint-disable-next-line import/no-dynamic-require,global-require
      .map((plugin) => require(path.join(pluginPath, plugin)))
      .map((plugin) => [plugin, plugin.schema()]);
    this.schemas = plugins.map(([_, schema]) => schema);
    this.plugins = plugins.map(([P, schema]) => {
      const schemaPath = Object.keys(schema);
      assert(schemaPath.length === 1);
      return new P(get(options, schemaPath[0], {}));
    });
  }

  getSchemas() {
    return this.schemas;
  }

  async before(kwargs) {
    for (let idx = 0; idx < this.plugins.length; idx += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.plugins[idx].before(kwargs);
    }
  }

  async after(kwargs) {
    for (let idx = 0; idx < this.plugins.length; idx += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.plugins[idx].after(kwargs);
    }
  }
}
module.exports.Module = Module;
