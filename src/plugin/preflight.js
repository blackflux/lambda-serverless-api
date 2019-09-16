const get = require('lodash.get');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class Preflight extends Plugin {
  constructor(options) {
    super(options);
    this.allowedHeaders = get(options, 'allowedHeaders', []);
    this.allowedOrigins = get(options, 'allowedOrigins', []);
  }

  static schema() {
    return {
      preflight: Joi.object().keys({
        allowedHeaders: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional(),
        allowedOrigins: Joi.alternatives(Joi.array().items(Joi.string()), Joi.function()).optional()
      }).optional()
    };
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  static weight() {
    return 0;
  }

  async after(kwargs) {
    // eslint-disable-next-line object-curly-newline
    const { event, response, router, headers } = kwargs;
    if (event.httpMethod !== 'OPTIONS') {
      return;
    }

    const { accessControlRequestMethod, accessControlRequestHeaders, origin } = headers;
    if ([
      accessControlRequestMethod,
      accessControlRequestHeaders,
      origin
    ].some((h) => h === undefined)) {
      return;
    }

    const allowedOrigins = Array.isArray(this.allowedOrigins) ? this.allowedOrigins : this.allowedOrigins(kwargs);
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
  }
}
module.exports = Preflight;
