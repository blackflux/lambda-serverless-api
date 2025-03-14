import assert from 'assert';
import get from 'lodash.get';
import Joi from 'joi-strict';

import { ApiErrorFn } from '../response/api-error.js';
import { Plugin } from '../plugin.js';
import Limiter from '../util/limiter.js';

class RateLimit extends Plugin {
  constructor(options) {
    super(options);
    this.enabled = get(options, 'enabled', true);
    this.identifierPaths = get(options, 'identifierPaths', ['requestContext.identity.sourceIp']);
    this.limiter = Limiter({
      awsSdkWrap: get(options, 'awsSdkWrap', null),
      bucket: get(options, 'bucket', null),
      globalLimit: get(options, 'globalLimit', 200),
      defaultRouteLimit: get(options, 'defaultRouteLimit', 100)
    });
  }

  static schema() {
    return {
      rateLimit: Joi.object().keys({
        enabled: Joi.boolean().optional(),
        identifierPaths: Joi.array().items(Joi.string()).optional(),
        awsSdkWrap: Joi.object(),
        bucket: Joi.string().optional(),
        // eslint-disable-next-line
        globalLimit: Joi.number().integer().min(0).allow(null).optional(),
        // eslint-disable-next-line
        defaultRouteLimit: Joi.number().integer().min(0).allow(null).optional()
      }).optional()
    };
  }

  static weight() {
    return 3;
  }

  async before({ event, request }) {
    assert(typeof request.route === 'string');
    if (this.enabled !== true) {
      return;
    }
    if (event.httpMethod === 'OPTIONS') {
      return;
    }
    const routeLimit = get(request.options, 'limit');
    if (routeLimit === null) {
      return;
    }
    let identifier;
    for (let idx = 0; idx < this.identifierPaths.length && identifier === undefined; idx += 1) {
      identifier = get(event, this.identifierPaths[idx]);
    }
    if (identifier === undefined) {
      throw new Error(`Rate limit identifier not found\n${JSON.stringify(event)}`);
    }

    try {
      await this.limiter({
        identifier,
        route: request.route,
        data: { event, request },
        routeLimit
      });
    } catch {
      const err = ApiErrorFn('Rate limit exceeded.', 429);
      err.headers = {
        'X-Rate-Limit-Reset': 60 - new Date().getSeconds()
      };
      throw err;
    }
  }
}
export default RateLimit;
