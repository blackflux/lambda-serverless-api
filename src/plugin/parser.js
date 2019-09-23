const Joi = require('joi-strict');
const { Plugin } = require('../plugin');
const toCamelCase = require('../util/to-camel-case');

class Parser extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  static schema() {
    return {
      parser: Joi.object().keys({}).optional()
    };
  }

  static weight() {
    return 2;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  beforeRegister({ request }) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  afterRegister({ request, route }) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before({ request, event }) {
    const paramsPending = request.params.map((curParam) => [toCamelCase(curParam.name), curParam.get(event)]);
    const paramsPendingObj = paramsPending.reduce((prev, [key, value]) => Object
      .assign(prev, { [key]: value }), {});
    const resolvedParams = await Promise.all(paramsPending
      .map(async ([name, value]) => [name, typeof value === 'function' ? await value(paramsPendingObj) : value]));
    Object.assign(event, {
      parsedParameters: resolvedParams
        .reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {})
    });
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async finalize() {}
}
module.exports = Parser;
