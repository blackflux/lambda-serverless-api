const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');
const { ApiResponse, ApiError } = require('../response');

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
    return 1;
  }

  async onUnrouted(kwargs) {
    const { event, router } = kwargs;
    if (event.httpMethod !== 'OPTIONS') {
      return null;
    }

    const {
      origin,
      'access-control-request-method': accessControlRequestMethod,
      'access-control-request-headers': accessControlRequestHeaders
    } = event.headers;
    if ([
      accessControlRequestMethod,
      accessControlRequestHeaders
    ].some((h) => h === undefined)) {
      throw ApiError('Required header missing', 403);
    }

    const allowedOrigins = await extractOrigins(this.allowedOrigins, kwargs);
    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      throw ApiError('Origin not allowed', 403);
    }
    if (!router.recognize(accessControlRequestMethod, get(event, 'path', ''))) {
      throw ApiError('Method not allowed', 403);
    }
    const allowedHeaders = [
      'Content-Type',
      'Accept',
      'Origin',
      ...(Array.isArray(this.allowedHeaders) ? this.allowedHeaders : await this.allowedHeaders(kwargs))
    ].map((h) => h.toLowerCase());
    if (!accessControlRequestHeaders.split(',').map((h) => h
      .trim().toLowerCase()).every((h) => allowedHeaders.includes(h))) {
      throw ApiError('Header not allowed', 403);
    }

    return ApiResponse('', 200, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': allowedHeaders.join(','),
      'Access-Control-Allow-Methods': accessControlRequestMethod
    });
  }

  async before(kwargs) {
    const { event } = kwargs;
    if (event.httpMethod === 'OPTIONS') {
      return;
    }

    set(kwargs, 'context.cors', {
      allowedOrigins: await extractOrigins(this.allowedOrigins, kwargs)
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async after(kwargs) {
    const { event, response } = kwargs;
    if (event.httpMethod === 'OPTIONS') {
      return;
    }
    const origin = get(event, 'headers.origin');
    if (origin === undefined) {
      return;
    }
    const allowedOrigins = get(kwargs, 'context.cors.allowedOrigins', []);
    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return;
    }
    set(response, ['headers', 'Access-Control-Allow-Origin'], origin);
  }
}
module.exports = Cors;
