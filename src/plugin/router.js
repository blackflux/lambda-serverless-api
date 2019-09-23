const get = require('lodash.get');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class Router extends Plugin {
  constructor(options) {
    super(options);
    this.prefix = get(options, 'prefix', null);
  }

  static schema() {
    return {
      router: Joi.object().keys({
        prefix: Joi.string().optional()
      }).optional()
    };
  }

  static weight() {
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  onRegister({ request }) {
    if (this.prefix !== null) {
      request.uri = `${this.prefix}${request.uri}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async finalize() {}
}
module.exports = Router;
