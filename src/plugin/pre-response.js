import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';

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
export default PreResponse;
