const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

const headers = {
  date: () => new Date().toUTCString()
};

class ResponseHeaders extends Plugin {
  constructor(options) {
    super(options);
    this.inject = get(options, 'inject', []);
  }

  static schema() {
    return {
      responseHeaders: Joi.object().keys({
        inject: Joi.array().items(Joi.string().valid(...Object.keys(headers)))
      }).optional()
    };
  }

  static weight() {
    return 0;
  }

  async after({ response }) {
    Object.entries(headers).forEach(([header, fn]) => {
      if (this.inject.includes(header)) {
        if (get(response, ['headers', header]) === undefined) {
          set(response, ['headers', header], fn());
        }
      }
    });
  }
}
module.exports = ResponseHeaders;
