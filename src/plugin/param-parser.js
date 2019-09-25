const Joi = require('joi-strict');
const { Plugin } = require('../plugin');
const toCamelCase = require('../util/to-camel-case');

class ParamParser extends Plugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  static schema() {
    return {
      paramParser: Joi.object().keys({}).optional()
    };
  }

  static weight() {
    return 4;
  }

  // eslint-disable-next-line class-methods-use-this
  async before({ request, event, context }) {
    const paramsPending = request.params.map((curParam) => [toCamelCase(curParam.name), curParam.get(event)]);
    const paramsPendingObj = paramsPending.reduce((prev, [key, value]) => Object
      .assign(prev, { [key]: value }), {});
    const resolvedParams = await Promise.all(paramsPending
      .map(async ([name, value]) => [name, typeof value === 'function' ? await value(paramsPendingObj) : value]));
    Object.assign(context, {
      parsedParameters: resolvedParams
        .reduce((prev, [key, value]) => Object.assign(prev, { [key]: value }), {})
    });
  }
}
module.exports = ParamParser;
