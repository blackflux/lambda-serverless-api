const assert = require('assert');
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
  const response = await module.before(kwargs)
    .then(() => handler(event.parsedParameters, context, event))
    .then((resp) => {
      assert(resp.isApiResponse === true);
      return resp;
    })
    .catch((err) => {
      assert(err instanceof Error);
      return err;
    });
  Object.assign(kwargs, { response });
  await module.after(kwargs);
  return asApiGatewayResponse(response);
};
