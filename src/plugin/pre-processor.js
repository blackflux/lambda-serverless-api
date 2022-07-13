import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';
import { ApiErrorFn } from '../response/api-error.js';
import objectAsLowerCase from '../util/object-rekey-lower-case.js';

class PreProcessor extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  static schema() {
    return {
      preProcessor: Joi.object().keys({}).optional()
    };
  }

  static weight() {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this
  async before({ event, lookup }) {
    Object.assign(event, {
      [lookup.key('header$')]: objectAsLowerCase(lookup.get('header$', {})),
      ...(lookup.has('mvheader$')
        ? { [lookup.key('mvheader$')]: objectAsLowerCase(lookup.get('mvheader$', {})) }
        : {})
    });
    try {
      if (lookup.integration === 'proxy' && lookup.has('json$')) {
        let json = lookup.get('json$');
        if (event.isBase64Encoded) {
          json = Buffer.from(json, 'base64').toString('utf8');
        }
        Object.assign(event, {
          [lookup.key('json$')]: JSON.parse(json)
        });
      }
    } catch (e) {
      throw ApiErrorFn('Invalid Json Body detected.', 400, 99001, {
        value: lookup.get('json$')
      });
    }
  }
}
export default PreProcessor;
