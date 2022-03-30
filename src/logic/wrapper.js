import assert from 'assert';
import Joi from 'joi-strict';
import * as apiGateway from './api-gateway.js';
import { VERSION_REGEX } from '../resources/format.js';

export const Wrapper = ({ router, module }) => {
  const endpoints = {};

  const wrapFn = (identifier, params, ...args) => {
    assert([1, 2].includes(args.length));
    const [options, handler] = args.length === 2 ? args : [{}, args[0]];
    Joi.assert(options, Joi.object().keys({
      limit: Joi
        .number()
        .integer()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .allow(null)
        .optional(),
      deprecated: Joi.alternatives().conditional('versioning', {
        is: false,
        then: Joi.forbidden(),
        otherwise: Joi.string().pattern(VERSION_REGEX)
      }).optional(),
      versioning: Joi.boolean().optional()
    }).optional());
    assert(typeof handler === 'function');

    const request = {
      params,
      options,
      .../^(?<method>[A-Z]+)\s(?<uri>.+)$/.exec(identifier).groups,
      routed: true
    };
    (() => {
      const resp = module.beforeRegister({ request });
      assert(resp === null, 'Plugin should not return from beforeRegister()');
    })();
    request.route = `${request.method} ${request.uri}`;

    endpoints[request.route] = params;

    const handlerFn = apiGateway.wrap({
      handler,
      request,
      router,
      module,
      params
    });
    handlerFn.isApiEndpoint = true;
    handlerFn.route = request.route;

    router.register(request.route, handlerFn);
    (() => {
      const resp = module.afterRegister({ request });
      assert(resp === null, 'Plugin should not return from afterRegister()');
    })();

    return apiGateway.wrapAsync(handlerFn);
  };

  return {
    wrap: wrapFn,
    endpoints
  };
};
