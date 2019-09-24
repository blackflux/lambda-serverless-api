const assert = require('assert');
const fs = require('fs');
const path = require('path');
const get = require('lodash.get');

class Module {
  constructor(pluginPath, options) {
    const plugins = fs
      .readdirSync(pluginPath)
      // eslint-disable-next-line import/no-dynamic-require,global-require
      .map((pluginFile) => require(path.join(pluginPath, pluginFile)))
      .sort((P1, P2) => P1.weight() - P2.weight())
      .map((P) => [P, P.schema()]);
    this.schemas = plugins.map(([_, schema]) => schema);
    this.plugins = plugins.map(([P, schema]) => {
      const schemaPath = Object.keys(schema);
      assert(schemaPath.length === 1);
      return new P(get(options, schemaPath[0], {}));
    });
    this.executeAsync = async (fn, kwargs) => {
      for (let idx = 0; idx < this.plugins.length; idx += 1) {
        // eslint-disable-next-line no-await-in-loop
        const resp = await this.plugins[idx][fn](kwargs);
        if (![null, undefined].includes(resp)) {
          return resp;
        }
      }
      return null;
    };
    this.executeSync = (fn, kwargs) => {
      for (let idx = 0; idx < this.plugins.length; idx += 1) {
        const resp = this.plugins[idx][fn](kwargs);
        assert(resp === undefined, 'Plugin must not return from this function');
      }
      return null;
    };
  }

  getSchemas() {
    return this.schemas;
  }

  getPlugins() {
    return this.plugins;
  }

  beforeRegister(kwargs) {
    return this.executeSync('beforeRegister', kwargs);
  }

  afterRegister(kwargs) {
    return this.executeSync('afterRegister', kwargs);
  }

  async onUnhandled(kwargs) {
    return this.executeAsync('onUnhandled', kwargs);
  }

  async before(kwargs) {
    return this.executeAsync('before', kwargs);
  }

  async after(kwargs) {
    return this.executeAsync('after', kwargs);
  }
}
module.exports.Module = Module;
