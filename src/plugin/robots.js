import get from 'lodash.get';
import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';
import { ApiResponse } from '../response/api-response.js';

class Robots extends Plugin {
  constructor(options) {
    super(options);
    this.response = get(options, 'response', 'User-agent: *\nDisallow: /');
  }

  static schema() {
    return {
      robots: Joi.object().keys({
        response: Joi.string().optional()
      }).optional()
    };
  }

  static weight() {
    return 3;
  }

  async onUnrouted({ event }) {
    if (event.path !== '/robots.txt' || event.httpMethod !== 'GET') {
      return null;
    }
    return ApiResponse(this.response);
  }
}
export default Robots;
