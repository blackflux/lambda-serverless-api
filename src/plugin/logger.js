const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi-strict');
const cloneDeep = require('lodash.clonedeep');
const objectScan = require('object-scan');
const { logger } = require('lambda-monitor-logger');
const { Plugin } = require('../plugin');
const { asApiGatewayResponse } = require('../logic/api-gateway');

class Logger extends Plugin {
  constructor(options) {
    super(options);
    this.prefix = get(options, 'prefix', [
      'response.statusCode',
      'response.body.messageId',
      'event.httpMethod',
      '$ROUTE'
    ]);
    this.logError = get(options, 'logError', true);
    this.logSuccess = get(options, 'logSuccess', true);
    this.parse = get(options, 'parse', () => {});
    this.success = get(options, 'success', ({ message }) => (
      Number.isInteger(message.response.statusCode)
      && message.response.statusCode >= 100
      && message.response.statusCode < 400
    ));
    this.level = get(options, 'level', ({ success }) => (success ? 'info' : 'warn'));
    const redactOptions = {
      joined: false,
      useArraySelector: false,
      filterFn: (key, value, { parents }) => {
        // eslint-disable-next-line no-param-reassign
        parents[0][key[key.length - 1]] = '**redacted**';
      }
    };
    this.redactSuccess = objectScan(get(options, 'redactSuccess', []), redactOptions);
    this.redactError = objectScan(get(options, 'redactError', []), redactOptions);
  }

  static schema() {
    return {
      logger: Joi.object().keys({
        prefix: Joi.array().items(Joi.string()).optional(),
        logSuccess: Joi.boolean().optional(),
        logError: Joi.boolean().optional(),
        parse: Joi.function().optional(),
        success: Joi.function().optional(),
        level: Joi.function().optional(),
        redactSuccess: Joi.array().items(Joi.string()).optional(),
        redactError: Joi.array().items(Joi.string()).optional()
      }).optional()
    };
  }

  static weight() {
    return 9999;
  }

  async after({ event, response, router }) {
    if (!this.logError && !this.logSuccess) {
      return;
    }
    const message = cloneDeep({
      event,
      response: asApiGatewayResponse(response, false)
    });
    this.parse(message);
    const success = this.success({ message });
    if ((success && !this.logSuccess) || (!success && !this.logError)) {
      return;
    }
    const level = this.level({ success, message });
    const matchedRoute = router.recognize(event.httpMethod, get(event, 'path', ''));
    const prefix = this.prefix
      .map((p) => {
        if (p === '$ROUTE') {
          return matchedRoute ? matchedRoute[0].handler.route.split(' ')[1] : get(message, 'event.path');
        }
        return get(message, p);
      })
      .filter((e) => !!e).join(' ');
    assert(prefix !== '');
    (success ? this.redactSuccess : this.redactError)(message);
    logger[level](`${prefix}\n${JSON.stringify(message)}`);
  }
}
module.exports = Logger;
