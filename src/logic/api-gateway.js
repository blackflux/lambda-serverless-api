/* load-hot */
import assert from 'assert';
import set from 'lodash.set';
import get from 'lodash.get';
import { wrap as lambdaAsyncWrap } from 'lambda-async';
import { logger } from 'lambda-monitor-logger';
import { serializeError } from 'serialize-error';
import Lookup from '../lookup.js';

const getErrorMessage = (error) => String(get(error, 'message', 'Exception')).split('\n')[0];

export const asApiGatewayResponse = (resp, stringifyJson = true) => {
  if (get(resp, 'isApiResponse') !== true) {
    throw resp;
  }

  const isApiError = get(resp, 'isApiError');
  assert([true, false].includes(isApiError));

  let body = isApiError ? {
    message: resp.message,
    messageId: resp.messageId,
    context: resp.context
  } : resp.payload;

  const isJsonResponse = get(resp, 'isJsonResponse') === true;
  if (isJsonResponse && stringifyJson) {
    body = JSON.stringify(body);
  }

  const isBinaryResponse = get(resp, 'isBinaryResponse') === true;
  if (isBinaryResponse) {
    body = body.toString('base64');
  }

  return {
    statusCode: resp.statusCode,
    body,
    ...(Object.keys(resp.headers).length === 0 ? {} : { headers: resp.headers }),
    ...(isBinaryResponse ? { isBase64Encoded: true } : {})
  };
};

export const wrap = ({
  handler,
  request,
  route,
  router,
  module,
  params = []
}) => async (event, context) => {
  const lookup = Lookup(event);
  if (!lookup.has('method')) {
    return Promise.resolve('OK - No API Gateway call detected.');
  }

  set(context, 'custom.executionStart', new Date() / 1);

  if (!lookup.has('uri')) {
    Object.assign(event, {
      [lookup.key('uri')]: request.route
        .replace(/^[^\s]+ \/?/, '/')
        .replace(/{([^}]+?)\+?}/g, (_, e) => get(event, ['pathParameters', e]))
    });
  }

  const kwargs = {
    request,
    event,
    lookup,
    context,
    route,
    router,
    params
  };
  let isError = false;
  const apply = [
    async () => {
      const resp = await module.before(kwargs);
      assert(resp === null, 'Plugin before() should not return');
      return handler(context.parsedParameters, context, event);
    },
    async (prevResp) => {
      if (!isError) {
        const resp = await module.afterSuccess(kwargs);
        assert(resp === null, 'Plugin afterSuccess() should not return');
      }
      return prevResp;
    },
    async (prevResp) => {
      const resp = await module.after(kwargs);
      assert(resp === null, 'Plugin after() should not return');
      return prevResp;
    }
  ];
  for (let idx = 0; idx < apply.length; idx += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      kwargs.response = await apply[idx](kwargs.response);
    } catch (err) {
      assert(idx === 0, 'Should not throw from afterSuccess() or after()');
      kwargs.response = err;
      isError = true;
    }
    assert(get(kwargs, 'response.isApiError', true) === isError);
    if (get(kwargs, 'response.isApiResponse', false) !== true) {
      break;
    }
  }
  return asApiGatewayResponse(kwargs.response);
};

export const wrapAsync = (handler) => {
  const h = (...kwargs) => handler(...kwargs).catch((error) => {
    logger.warn([
      `${getErrorMessage(error)}: ${handler.route}`,
      JSON.stringify({
        context: 'lambda-serverless-api',
        route: handler.route,
        error: serializeError(error)
      })
    ].join('\n'));
    return {
      statusCode: 500,
      body: '{"message":"Internal Server Error"}'
    };
  });
  return Object.assign(
    lambdaAsyncWrap(h),
    Object
      .entries(handler)
      .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {})
  );
};
