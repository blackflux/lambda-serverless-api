import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';
import { ApiErrorFn } from '../response/api-error.js';
import objectAsLowerCase from '../util/object-rekey-lower-case.js';

class PreProcessor extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  static schema() {
    return {
      preProcessor: Joi.object().keys({}).optional()
    };
  }

  static weight() {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this
  async before({ event }) {
    Object.assign(event, {
      headers: objectAsLowerCase(event.headers || {}),
      ...(event.multiValueHeaders !== undefined
        ? { multiValueHeaders: objectAsLowerCase(event.multiValueHeaders) }
        : {})
    });
    try {
      if (event.body !== undefined) {
        let { body } = event;
        if (event.isBase64Encoded) {
          body = Buffer.from(body, 'base64').toString('utf8');
        }
        body = JSON.parse(body);
        Object.assign(event, { body });
      }
    } catch {
      throw ApiErrorFn('Invalid Json Body detected.', 400, 99001, {
        value: event.body
      });
    }
  }
}
export default PreProcessor;
