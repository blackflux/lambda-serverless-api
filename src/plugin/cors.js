const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class Cors extends Plugin {
  constructor(options) {
    super(options);
    this.allowedOrigins = get(options, 'allowedOrigins', []);
  }

  static schema() {
    return {
      cors: Joi.object().keys({
        allowedOrigins: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional()
      }).optional()
    };
  }

  static weight() {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  async after(kwargs) {
    const { response, headers } = kwargs;
    if (get(response, ['headers', 'Access-Control-Allow-Origin']) !== undefined) {
      return;
    }
    const { origin } = headers;
    if (origin === undefined) {
      return;
    }

    const allowedOrigins = Array.isArray(this.allowedOrigins) ? this.allowedOrigins : this.allowedOrigins(kwargs);
    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return;
    }
    set(response, ['headers', 'Access-Control-Allow-Origin'], origin);
  }
}
module.exports = Cors;
