const assert = require('assert');
const get = require('lodash.get');
const { asApiGatewayResponse } = require('../response');

module.exports.wrap = (handler, {
  request,
  route,
  router,
  module,
  params = [],
  options = {}
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
    params,
    options
  };
  let response;
  let isSuccess = true;
  try {
    await module.before(kwargs);
    response = await handler(event.parsedParameters, context, event);
  } catch (err) {
    response = err;
    isSuccess = false;
  }
  assert(get(response, 'isApiResponse', false) === isSuccess);
  Object.assign(kwargs, { response });
  await module.after(kwargs);
  return asApiGatewayResponse(response);
};
