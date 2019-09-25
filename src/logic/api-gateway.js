const assert = require('assert');
const get = require('lodash.get');
const { wrap: wrapAsync } = require('lambda-async');

const asApiGatewayResponse = (resp, stringifyJson = true) => {
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
module.exports.asApiGatewayResponse = asApiGatewayResponse;

module.exports.wrap = ({
  handler,
  request,
  route,
  router,
  module,
  params = []
}) => async (event, context) => {
  if (!event.httpMethod) {
    return Promise.resolve('OK - No API Gateway call detected.');
  }
  const kwargs = {
    request,
    event,
    context,
    route,
    router,
    params
  };
  const apply = [
    async () => {
      const resp = await module.before(kwargs);
      assert(resp === null, 'Plugin before() should not return');
      return handler(context.parsedParameters, context, event);
    },
    async (prevResp) => {
      const resp = await module.after(kwargs);
      assert(resp === null, 'Plugin after() should not return');
      return prevResp;
    }
  ];
  let isError = false;
  for (let idx = 0; idx < apply.length; idx += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      kwargs.response = await apply[idx](kwargs.response);
    } catch (err) {
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

module.exports.wrapAsync = (handler) => Object.assign(
  wrapAsync(handler),
  Object
    .entries(handler)
    .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {})
);
