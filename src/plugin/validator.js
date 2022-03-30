import get from 'lodash.get';
import difference from 'lodash.difference';
import Joi from 'joi-strict';
import { logger } from 'lambda-monitor-logger';
import { symbols } from '../logic/symbols.js';
import { Plugin } from '../plugin.js';
import { ApiError } from '../response/api-error.js';

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

    if (event[symbols.viaRouter] !== true) {
      const matched = router.recognize(event.httpMethod, get(event, 'path', ''));
      if (matched === undefined || matched[0].handler.route !== request.route) {
        const routeSubstituted = request.route
          .replace(' ', ' /')
          .replace(/{([^}]+?)\+?}/g, (_, e) => get(event, ['pathParameters', e]));
        logger.warn([
          'Server Configuration Error: Bad Routing',
          `Expected route to match "${routeSubstituted}"`
        ].join('\n'));
        throw ApiError('Server Configuration Error.', 400, 99006);
      }
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
export default Validator;
