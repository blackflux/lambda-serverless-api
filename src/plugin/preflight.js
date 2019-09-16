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
        allowedHeaders: Joi.array().items(Joi.string()).optional(),
        allowedOrigins: Joi.array().items(Joi.string()).optional()
      }).optional()
    };
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  static weight() {
    return 0;
  }

  // eslint-disable-next-line object-curly-newline
  async after({ event, response, router, headers }) {
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

    if (!this.allowedOrigins.includes(origin) && !this.allowedOrigins.includes('*')) {
      return;
    }
    if (!router.recognize(`${accessControlRequestMethod}${get(event, 'path', '')}`)) {
      return;
    }
    const allowedHeaders = [
      'Content-Type',
      'Accept',
      ...this.allowedHeaders
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
