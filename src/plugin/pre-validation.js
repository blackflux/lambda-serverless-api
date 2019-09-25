const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class PreValidation extends Plugin {
  constructor(options) {
    super(options);
    this.preValidation = typeof options === 'function' ? options : () => {};
  }

  static schema() {
    return {
      preValidation: Joi.function().optional()
    };
  }

  static weight() {
    return 2;
  }

  async before(kwargs) {
    await this.preValidation(kwargs);
  }
}
module.exports = PreValidation;
