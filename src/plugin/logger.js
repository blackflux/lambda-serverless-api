import assert from 'assert';
import get from 'lodash.get';
import Joi from 'joi-strict';
import cloneDeep from 'lodash.clonedeep';
import objectScan from 'object-scan';
import { logger, json } from 'lambda-monitor-logger';
import { Plugin } from '../plugin.js';
import { asApiGatewayResponse } from '../logic/api-gateway.js';

class Logger extends Plugin {
  constructor(options) {
    super(options);
    this.signature = get(options, 'signature', [
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
      filterFn: ({ key, parents }) => {
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
        signature: Joi.array().items(Joi.string()).optional(),
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

  async after({
    event, context, request, response, router
  }) {
    if (!this.logError && !this.logSuccess) {
      return;
    }
    const message = cloneDeep({
      event,
      response: asApiGatewayResponse(response, false)
    });
    await this.parse(message);
    const success = this.success({ message });
    const { options } = request;
    const logSuccess = (
      options.logSuccess === true
      || (this.logSuccess === true && options.logSuccess !== false)
    );
    const logError = (
      options.logError === true
      || (this.logError === true && options.logError !== false)
    );
    if ((success && !logSuccess) || (!success && !logError)) {
      return;
    }

    const signature = this.signature
      .map((p) => {
        if (p === '$ROUTE') {
          const matchedRoute = router.recognize(event.httpMethod, get(event, 'path', ''));
          return matchedRoute ? matchedRoute[0].handler.route.split(' ')[1] : get(message, 'event.path');
        }
        return get(message, p);
      })
      .filter((e) => !!e).join(' ');
    assert(signature !== '');

    const level = this.level({ success, signature, message });
    (success ? this.redactSuccess : this.redactError)(message);
    logger[level](`${signature}\n${JSON.stringify(message)}`);
    json.log({
      signature,
      success,
      level,
      timings: {
        duration: new Date() / 1 - get(context, 'custom.executionStart')
      },
      ...message
    });
  }
}

export default Logger;
