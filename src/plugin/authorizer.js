const Joi = require('joi-strict');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

class Authorizer extends Plugin {
  constructor(options) {
    super(options);
    this.authorizor = typeof options === 'function' ? options : () => true;
  }

  static schema() {
    return {
      authorizer: Joi.function().optional()
    };
  }

  static weight() {
    return 1;
  }

  async before(kwargs) {
    const { event } = kwargs;
    if (event.httpMethod === 'OPTIONS') {
      return;
    }
    if (await this.authorizor(kwargs) !== true) {
      throw ApiError('Unauthorized', 401);
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}
}
module.exports = Authorizer;
