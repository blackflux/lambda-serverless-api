import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';

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
    return 5;
  }

  async before(kwargs) {
    await this.preValidation(kwargs);
  }
}
export default PreValidation;
