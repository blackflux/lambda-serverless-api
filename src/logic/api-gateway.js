const assert = require('assert');
const get = require('lodash.get');

const asApiGatewayResponse = (resp, stringifyJson = true) => {
  if (get(resp, 'isApiResponse') !== true) {
    throw resp;
  }
  if (get(resp, 'isApiError') === true) {
    const body = {
      message: resp.message,
      messageId: resp.messageId,
      context: resp.context
    };
    return {
      statusCode: resp.statusCode,
      body: stringifyJson ? JSON.stringify(body) : body
    };
  }
  assert(get(resp, 'isApiError') === false);
  const headers = resp.headers;
  let body = resp.payload;
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
    ...(Object.keys(headers).length === 0 ? {} : { headers }),
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
      await module.before(kwargs);
      kwargs.response = await handler(context.parsedParameters, context, event);
    },
    async () => module.after(kwargs)
  ];
  let isError = false;
  for (let idx = 0; idx < apply.length; idx += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await apply[idx]();
    } catch (err) {
      kwargs.response = err;
      isError = true;
    }
    assert(get(kwargs, 'response.isApiError', true) === isError);
    if (!get(kwargs, 'response.isApiResponse', false)) {
      break;
    }
  }
  return asApiGatewayResponse(kwargs.response);
};
