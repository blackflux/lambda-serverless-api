const Joi = require('joi-strict');
const { Plugin } = require('../plugin');

class AutoPrune extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  static schema() {
    return {
      autoPrune: Joi.object().keys({}).optional()
    };
  }

  static weight() {
    return 1;
  }

  // eslint-disable-next-line class-methods-use-this
  afterRegister({ request }) {
    const { params } = request;
    if (params.filter((p) => p.paramType === 'FieldsParam' && typeof p.autoPrune === 'string').length > 1) {
      throw new Error('Only one auto pruning "FieldsParam" per endpoint.');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async after({ params, context, response }) {
    const rawAutoPruneFieldsParam = params
      .find((p) => p.paramType === 'FieldsParam' && typeof p.autoPrune === 'string');
    if (rawAutoPruneFieldsParam !== undefined && context.parsedParameters[rawAutoPruneFieldsParam.name] !== undefined) {
      rawAutoPruneFieldsParam.pruneFields(response, context.parsedParameters[rawAutoPruneFieldsParam.name]);
    }
  }
}
module.exports = AutoPrune;
