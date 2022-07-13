import Joi from 'joi-strict';
import { Plugin } from '../plugin.js';
import toCamelCase from '../util/to-camel-case.js';

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
    return 7;
  }

  // eslint-disable-next-line class-methods-use-this
  async before({ request, lookup, context }) {
    const paramsPending = request.params.map((curParam) => [
      toCamelCase(curParam.name),
      curParam.get(lookup.get(`${curParam.position}$${curParam.name}`))
    ]);
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
export default ParamParser;
