const get = require('lodash.get');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class Router extends Plugin {
  constructor(options) {
    super(options);
    this.prefix = get(options, 'prefix', null);
    this.routeSignatures = [];
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

  beforeRegister({ request }) {
    if (this.prefix !== null) {
      request.uri = `${this.prefix}${request.uri}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  afterRegister({ request, route }) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async finalize() {}
}
module.exports = Router;
