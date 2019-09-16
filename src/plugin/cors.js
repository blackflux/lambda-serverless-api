const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

const extractOrigins = (allowedOrigins, kwargs) => (Array.isArray(allowedOrigins)
  ? allowedOrigins
  : allowedOrigins(kwargs));

class Cors extends Plugin {
  constructor(options) {
    super(options);
    this.allowedHeaders = get(options, 'allowedHeaders', []);
    this.allowedOrigins = get(options, 'allowedOrigins', []);
  }

  static schema() {
    return {
      cors: Joi.object().keys({
        allowedHeaders: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional(),
        allowedOrigins: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional()
      }).optional()
    };
  }

  static weight() {
    return 0;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  async after(kwargs) {
    // eslint-disable-next-line object-curly-newline
    const { event, response, router, headers } = kwargs;
    if (event.httpMethod === 'OPTIONS') {
      const { accessControlRequestMethod, accessControlRequestHeaders, origin } = headers;
      if ([
        accessControlRequestMethod,
        accessControlRequestHeaders,
        origin
      ].some((h) => h === undefined)) {
        return;
      }

      const allowedOrigins = extractOrigins(this.allowedOrigins, kwargs);
      if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
        return;
      }
      if (!router.recognize(`${accessControlRequestMethod}${get(event, 'path', '')}`)) {
        return;
      }
      const allowedHeaders = [
        'Content-Type',
        'Accept',
        ...(Array.isArray(this.allowedHeaders) ? this.allowedHeaders : this.allowedHeaders(kwargs))
      ].map((h) => h.toLowerCase());
      if (!accessControlRequestHeaders.split(',').map((h) => h
        .trim().toLowerCase()).every((h) => allowedHeaders.includes(h))) {
        return;
      }

      Object.assign(response, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': allowedHeaders.join(','),
          'Access-Control-Allow-Methods': accessControlRequestMethod
        }
      });
    } else {
      const { origin } = headers;
      if (origin === undefined) {
        return;
      }

      const allowedOrigins = extractOrigins(this.allowedOrigins, kwargs);
      if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
        return;
      }
      set(response, ['headers', 'Access-Control-Allow-Origin'], origin);
    }
  }
}
module.exports = Cors;
