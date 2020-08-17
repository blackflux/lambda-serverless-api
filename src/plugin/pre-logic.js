const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class PreLogic extends Plugin {
  constructor(options) {
    super(options);
    this.preLogic = typeof options === 'function' ? options : () => {};
  }

  static schema() {
    return {
      preLogic: Joi.function().optional()
    };
  }

  static weight() {
    return 8;
  }

  async before(kwargs) {
    await this.preLogic(kwargs);
  }
}
module.exports = PreLogic;
