const Joi = require('joi-strict');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');
const objectAsLowerCase = require('../util/object-rekey-lower-case');

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
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this
  async before({ event }) {
    try {
      if (event.body !== undefined) {
        Object.assign(event, { body: JSON.parse(event.body) });
      }
    } catch (e) {
      throw ApiError('Invalid Json Body detected.', 400, 99001, {
        value: event.body
      });
    }
    Object.assign(event, {
      headers: objectAsLowerCase(event.headers || {}),
      ...(event.multiValueHeaders !== undefined
        ? { multiValueHeaders: objectAsLowerCase(event.multiValueHeaders) }
        : {})
    });
  }
}
module.exports = PreProcessor;
