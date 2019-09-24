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
}
module.exports = Router;
