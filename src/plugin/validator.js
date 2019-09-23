const difference = require('lodash.difference');
const get = require('lodash.get');
const Joi = require('joi-strict');
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
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  beforeRegister({ request }) {}

  afterRegister({ request, route }) {
    const { params } = request;

    // test for param issues
    if (request.method === 'GET' && params.some((p) => p.position === 'json')) {
      throw new Error('Can not use JSON parameter with GET requests.');
    }
    if (params.filter((p) => p.position === 'path').some((p) => !request.uri.includes(`{${p.nameOriginal}}`))) {
      throw new Error('Path Parameter not defined in given path.');
    }

    // test for route collisions
    const routeSignature = route.split(/[\s/]/g).map((e) => e.replace(/^{.*?}$/, ':param'));
    this.routeSignatures.forEach((signature) => {
      if (routeSignature.length !== signature.length) {
        return;
      }
      for (let idx = 0; idx < signature.length; idx += 1) {
        if (signature[idx] !== routeSignature[idx]) {
          return;
        }
      }
      throw new Error(`Path collision: ${route}`);
    });
    this.routeSignatures.push(routeSignature);
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before({ request, event }) {
    const receivedRequestMethod = get(event, 'httpMethod');
    if (receivedRequestMethod !== request.method) {
      throw new Error('Request Method Mismatch');
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

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async finalize() {}
}
module.exports = Validator;
