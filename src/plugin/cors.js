import get from 'lodash.get';
import set from 'lodash.set';
import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';
import { ApiError } from '../response/api-error.js';
import { ApiResponse } from '../response/api-response.js';

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
    return 2;
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

    const cors = {
      origin: undefined,
      allowOrigin: false
    };
    set(kwargs, 'context.cors', cors);

    const origin = get(event, 'headers.origin');
    if (origin === undefined) {
      return;
    }
    cors.origin = origin;

    const allowedOrigins = await extractOrigins(this.allowedOrigins, kwargs);
    cors.allowOrigin = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  }

  // eslint-disable-next-line class-methods-use-this
  async after(kwargs) {
    const cors = get(kwargs, 'context.cors', {});

    if (cors.allowOrigin === true) {
      set(kwargs.response, ['headers', 'Access-Control-Allow-Origin'], cors.origin);
    }
  }
}
export default Cors;
