const get = require('lodash.get');
const set = require('lodash.set');
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
    this.redactor = (input) => objectScan(get(options, 'redact', []), {
      joined: false,
      useArraySelector: false,
      filterFn: (key) => {
        set(input, key, '**redacted**');
      }
    })(input);
  }

  static schema() {
    return {
      logger: Joi.object().keys({
        logSuccess: Joi.boolean().optional(),
        logError: Joi.boolean().optional(),
        redact: Joi.array().items(Joi.string()).optional()
      }).optional()
    };
  }

  static weight() {
    return 9999;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  async after({ event, response }) {
    const success = Number.isInteger(response.statusCode) && response.statusCode >= 100 && response.statusCode < 400;
    if ((!success && this.logError) || (success && this.logSuccess)) {
      const toLog = cloneDeep({ event, response });
      this.redactor(toLog);
      logger[success ? 'info' : 'warn'](JSON.stringify(toLog));
    }
  }
}
module.exports = Logger;
