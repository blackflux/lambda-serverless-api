const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

const headers = {
  date: () => new Date().toUTCString(),
  'server-timing': ({ context }) => `total;dur=${
    (new Date() / 1 - get(context, 'custom.responseHeaders.requestStart')) / 1000
  }`
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

  // eslint-disable-next-line class-methods-use-this
  async before({ context }) {
    set(context, 'custom.responseHeaders.requestStart', new Date() / 1);
  }

  async after(kwargs) {
    const { response } = kwargs;
    Object.entries(headers).forEach(([header, fn]) => {
      if (this.inject.includes(header)) {
        if (get(response, ['headers', header]) === undefined) {
          set(response, ['headers', header], fn(kwargs));
        }
      }
    });
  }
}
module.exports = ResponseHeaders;
