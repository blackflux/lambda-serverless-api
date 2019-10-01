const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class PreResponse extends Plugin {
  constructor(options) {
    super(options);
    this.preResponse = typeof options === 'function' ? options : () => {};
  }

  static schema() {
    return {
      preResponse: Joi.function().optional()
    };
  }

  static weight() {
    return 10000;
  }

  async after(kwargs) {
    await this.preResponse(kwargs);
  }
}
module.exports = PreResponse;
