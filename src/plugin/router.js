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

  afterRegister({ route }) {
    // test for route collisions
    const routeSignature = route.split(/[\s/]/g).map((e) => e.replace(/^{.*?}$/, ':param'));
    this.routeSignatures.forEach((signature) => {
      if (routeSignature.length !== signature.length) {
        return;
      }
      for (let idx = 0; idx < signature.length; idx += 1) {
        if (signature[idx] !== routeSignature[idx]) {
          return;
        }
      }
      throw new Error(`Path collision: ${route}`);
    });
    this.routeSignatures.push(routeSignature);
  }

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
