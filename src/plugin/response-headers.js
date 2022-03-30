import get from 'lodash.get';
import set from 'lodash.set';
import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';

const headers = {
  date: () => new Date().toUTCString(),
  'server-timing': ({ context }) => `total;dur=${
    new Date() / 1 - get(context, 'custom.executionStart')
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
export default ResponseHeaders;
