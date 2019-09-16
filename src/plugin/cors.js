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
        allowedOrigins: Joi.array().items(Joi.string()).optional()
      }).optional()
    };
  }

  static weight() {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  async after({ event, response, headers }) {
    if (get(response, ['headers', 'Access-Control-Allow-Origin']) !== undefined) {
      return;
    }
    const { origin } = headers;
    if (origin === undefined) {
      return;
    }

    if (!this.allowedOrigins.includes(origin) && !this.allowedOrigins.includes('*')) {
      return;
    }
    set(response, ['headers', 'Access-Control-Allow-Origin'], origin);
  }
}
module.exports = Cors;
