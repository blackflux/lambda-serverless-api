import get from 'lodash.get';
import RouteRecognizer from 'route-recognizer';
import { symbols } from './symbols.js';
import * as apiGateway from './api-gateway.js';
import { ApiErrorFn } from '../response/api-error.js';
import Lookup from '../lookup.js';

export const Router = ({ module }) => {
  const router = (() => {
    const routerRec = new RouteRecognizer();
    return {
      register: (route, handler) => routerRec.add([{
        path: route.split(/[\s/]/g).map((e) => e.replace(
          /^{(.*?)(\+)?}$/,
          (_, name, type) => `${type === '+' ? '*' : ':'}${name}`
        )).join('/'),
        handler
      }]),
      recognize: (method, path) => routerRec.recognize(`${method}${path}`)
    };
  })();

  const handler = async (event, context) => {
    await module.beforeRouting({ event, context, router });
    const matchedRoutes = router.recognize(event.httpMethod, get(event, 'path', ''));
    if (!matchedRoutes) {
      const request = {
        params: [],
        options: {},
        method: event.httpMethod,
        uri: get(event, 'path', ''),
        routed: false
      };
      request.route = `${request.method} ${request.uri}`;
      return apiGateway.wrap({
        handler: async () => {
          const resp = await module.onUnrouted({
            event,
            lookup: Lookup(event),
            context,
            router
          });
          if (resp === null) {
            throw ApiErrorFn('Method / Route not allowed', 403);
          }
          return resp;
        },
        request,
        router,
        module
      })(event, context);
    }
    Object.assign(event, { pathParameters: matchedRoutes[0].params });
    Object.defineProperty(event, symbols.viaRouter, { value: true, writable: false });
    return matchedRoutes[0].handler(event, context);
  };
  handler.isRouter = true;
  handler.isApiEndpoint = true;
  handler.route = 'ANY';

  return Object.assign(router, {
    handler: apiGateway.wrapAsync(handler)
  });
};
