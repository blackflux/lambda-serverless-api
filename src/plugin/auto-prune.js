const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class AutoPrune extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  static schema() {
    return {
      autoPrune: Joi.object().keys().optional()
    };
  }

  static weight() {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  beforeRegister({ request }) {
    const { params } = request;
    if (params.filter((p) => p.paramType === 'FieldsParam' && typeof p.autoPrune === 'string').length > 1) {
      throw new Error('Only one auto pruning "FieldsParam" per endpoint.');
    }
  }

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  afterRegister() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async onUnhandled() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async before() {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async after({ params, paramsOut, response }) {}

  // eslint-disable-next-line class-methods-use-this,no-empty-function
  async finalize() {}
}
module.exports = AutoPrune;
