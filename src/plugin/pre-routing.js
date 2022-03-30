import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';

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
    return 0;
  }

  async beforeRouting(kwargs) {
    await this.preRouting(kwargs);
  }
}
export default PreRouting;
