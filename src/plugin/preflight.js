const get = require('lodash.get');
const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

const normalizeHeader = (name) => name
  .replace(/(?:^\w|[A-Z]|\b\w)/g, (l, idx) => (idx === 0 ? l.toLowerCase() : l.toUpperCase()))
  .replace(/[^a-zA-Z0-9]+/g, '');

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

  async after({ event, response, router }) {
    if (event.httpMethod !== 'OPTIONS') {
      return;
    }

    const {
      accessControlRequestMethod,
      accessControlRequestHeaders,
      origin
    } = Object.entries(event.headers || {})
      .map(([h, v]) => [normalizeHeader(h), v])
      .filter(([h]) => [
        'accessControlRequestMethod',
        'accessControlRequestHeaders',
        'origin'
      ].includes(h))
      .reduce((p, [h, v]) => Object.assign(p, { [h]: v }), {});
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
