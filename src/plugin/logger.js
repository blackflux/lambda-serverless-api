const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi-strict');
const cloneDeep = require('lodash.clonedeep');
const objectScan = require('object-scan');
const { logger } = require('lambda-monitor-logger');
const { Plugin } = require('../plugin');

class Logger extends Plugin {
  constructor(options) {
    super(options);
    this.logError = get(options, 'logError', true);
    this.logSuccess = get(options, 'logSuccess', true);
    this.parse = get(options, 'parse', () => {});
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
        logSuccess: Joi.boolean().optional(),
        logError: Joi.boolean().optional(),
        parse: Joi.function().optional(),
        redactSuccess: Joi.array().items(Joi.string()).optional(),
        redactError: Joi.array().items(Joi.string()).optional()
      }).optional()
    };
  }

  static weight() {
    return 9999;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  onRegister() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}

  async finalize({ event, response, router }) {
    const success = Number.isInteger(response.statusCode) && response.statusCode >= 100 && response.statusCode < 400;
    if ((!success && this.logError) || (success && this.logSuccess)) {
      const toLog = cloneDeep({ event, response });
      this.parse(toLog);
      (success ? this.redactSuccess : this.redactError)(toLog);
      const matchedRoute = router.recognize(`${event.httpMethod}${get(event, 'path', '')}`);
      const prefix = [
        get(toLog, 'response.statusCode'),
        get(toLog, 'event.httpMethod'),
        matchedRoute ? matchedRoute[0].handler.route.split(' ')[1] : get(toLog, 'event.path')
      ].filter((e) => !!e).join(' ');
      const msg = JSON.stringify(toLog);
      assert(prefix !== '');
      logger[success ? 'info' : 'warn'](`${prefix}\n${msg}`);
    }
  }
}
module.exports = Logger;
