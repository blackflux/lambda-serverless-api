const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class PreRouting extends Plugin {
  constructor(options) {
    super(options);
    this.preRouting = typeof options === 'function' ? options : () => {};
  }

  static schema() {
    return {
      preRouting: Joi.function().optional()
    };
  }

  static weight() {
    return 1;
  }

  async beforeRouting(kwargs) {
    await this.preRouting(kwargs);
  }
}
module.exports = PreRouting;
