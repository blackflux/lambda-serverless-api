const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi-strict');
const Limiter = require('lambda-rate-limiter');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

class RateLimit extends Plugin {
  constructor(options) {
    super(options);
    this.globalLimit = get(options, 'globalLimit', 100);
    this.tokenPaths = get(options, 'tokenPaths', ['requestContext.identity.sourceIp']);
    this.limiter = Limiter({
      interval: get(options, 'interval', 60000),
      uniqueTokenPerInterval: get(options, 'uniqueTokenPerInterval', 500)
    });
  }

  static schema() {
    return {
      rateLimit: Joi.object().keys({
        globalLimit: Joi.number().integer().min(0).allow(null)
          .optional(),
        tokenPaths: Joi.array().items(Joi.string()).optional(),
        interval: Joi.number().integer().min(0).optional(),
        uniqueTokenPerInterval: Joi.number().integer().min(0).optional()
      }).optional()
    };
  }

  static weight() {
    return 1;
  }

  async before({ event, request }) {
    assert(typeof request.route === 'string');
    if (event.httpMethod === 'OPTIONS') {
      return;
    }
    const endpointLimit = get(request.options, 'limit', this.globalLimit);
    if (endpointLimit === null) {
      return;
    }
    let token;
    for (let idx = 0; idx < this.tokenPaths.length && token === undefined; idx += 1) {
      token = get(event, this.tokenPaths[idx]);
    }
    if (token === undefined) {
      throw new Error(`Rate limit token not found\n${JSON.stringify(event)}`);
    }
    try {
      await this.limiter.check(endpointLimit, `${token}/${request.route}`);
    } catch (e) {
      throw ApiError('Rate limit exceeded.', 429);
    }
  }
}
module.exports = RateLimit;
