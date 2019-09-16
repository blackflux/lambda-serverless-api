const get = require('lodash.get');
const Joi = require('joi-strict');
const Limiter = require('lambda-rate-limiter');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

class RateLimit extends Plugin {
  constructor(options) {
    super(options);
    this.globalLimit = get(options, 'globalLimit', 100);
    this.tokenPaths = get(options, 'rateLimitTokenPaths', ['requestContext.identity.sourceIp']);
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
    return 0;
  }

  async before({ event, request, options }) {
    const endpointLimit = get(options, 'limit', this.globalLimit);
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
      await this.limiter.check(endpointLimit, `${token}/${request}`);
    } catch (e) {
      throw ApiError('Rate limit exceeded.', 429);
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}
}
module.exports = RateLimit;
