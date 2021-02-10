const get = require('lodash.get');
const difference = require('lodash.difference');
const Joi = require('joi-strict');
const { logger } = require('lambda-monitor-logger');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

class Validator extends Plugin {
  constructor(options) {
    super(options);
    this.routeSignatures = [];
  }

  static schema() {
    return {
      validator: Joi.object().keys({}).optional()
    };
  }

  static weight() {
    return 6;
  }

  afterRegister({ request }) {
    const { params } = request;

    // test for param issues
    if (request.method === 'GET' && params.some((p) => p.position === 'json')) {
      throw new Error('Can not use JSON parameter with GET requests.');
    }
    if (params.filter((p) => p.position === 'path').some((p) => !request.uri.includes(`{${p.nameOriginal}}`))) {
      throw new Error('Path Parameter not defined in given path.');
    }

    // test for route collisions
    const routeSignature = request.route.split(/[\s/]/g).map((e) => e.replace(/^{.*?}$/, ':param'));
    this.routeSignatures.forEach((signature) => {
      if (routeSignature.length !== signature.length) {
        return;
      }
      for (let idx = 0; idx < signature.length; idx += 1) {
        if (signature[idx] !== routeSignature[idx]) {
          return;
        }
      }
      throw new Error(`Path collision: ${request.route}`);
    });
    this.routeSignatures.push(routeSignature);
  }

  // eslint-disable-next-line class-methods-use-this
  async before({ router, request, event }) {
    const receivedRequestMethod = event.httpMethod;
    if (receivedRequestMethod !== request.method) {
      throw new Error('Request Method Mismatch');
    }

    if (request.routed === false) {
      return;
    }

    const routeSubstituted = request.route
      .replace(' ', ' /')
      .replace(/{([^}]+?)\+?}/g, (_, e) => get(event, ['pathParameters', e]));

    const matched = router.recognize(event.httpMethod, get(event, 'path', ''));
    if (matched === undefined || matched[0].handler.route !== request.route) {
      logger.warn([
        'Server Configuration Error: Bad Routing',
        `Expected route to match "${routeSubstituted}"`
      ].join('\n'));
      throw ApiError('Server Configuration Error.', 400, 99006);
    }

    if (routeSubstituted.slice(routeSubstituted.indexOf(' ') + 1) !== get(event, 'path', '')) {
      logger.warn([
        'Server Configuration Error: Bad Routing',
        `Expected route to match "${routeSubstituted}"`
      ].join('\n'));
      throw ApiError('Server Configuration Error.', 400, 99007);
    }

    const invalidQsParams = difference(
      Object.keys(event.queryStringParameters || {}),
      request.params.filter((p) => p.position === 'query').map((p) => p.name)
    );
    if (invalidQsParams.length !== 0) {
      throw ApiError('Invalid Query Param(s) detected.', 400, 99004, {
        value: invalidQsParams
      });
    }

    const invalidJsonParams = difference(
      Object.keys(event.body || {}),
      request.params.filter((p) => p.position === 'json').map((p) => p.name)
    );
    if (invalidJsonParams.length !== 0) {
      throw ApiError('Invalid Json Body Param(s) detected.', 400, 99005, {
        value: invalidJsonParams
      });
    }
  }
}
module.exports = Validator;
