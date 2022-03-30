import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';

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
export default PreLogic;
