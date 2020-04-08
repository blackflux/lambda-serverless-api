const get = require('lodash.get');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');
const { ApiResponse } = require('../response');

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
module.exports = Robots;
