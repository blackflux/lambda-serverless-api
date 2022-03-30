import get from 'lodash.get';
import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';

class Router extends Plugin {
  constructor(options) {
    super(options);
    this.prefix = get(options, 'prefix', null);
    this.routeSignatures = [];
  }

  static schema() {
    return {
      router: Joi.object().keys({
        prefix: Joi.string().optional()
      }).optional()
    };
  }

  static weight() {
    return 0;
  }

  beforeRegister({ request }) {
    if (this.prefix !== null) {
      request.uri = `${this.prefix}${request.uri}`;
    }
  }
}
export default Router;
