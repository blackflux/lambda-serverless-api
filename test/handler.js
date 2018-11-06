const api = require('./../src/api').Api();

module.exports.error = api.wrap('GET error', [], process.env.RATE_LIMIT, () => {
  throw api.ApiError('Some Error', 400, 2341);
});

module.exports.exception = api.wrap('GET exception', [], process.env.RATE_LIMIT, () => {
  throw Error('Some Exception');
});

module.exports.text = api.wrap('GET text', [], process.env.RATE_LIMIT, () => api.ApiResponse('some text'));

module.exports.json = api.wrap('GET json', [], process.env.RATE_LIMIT, () => api.JsonResponse({ some: 'json' }));

module.exports.proxy = api.wrap('GET proxy/{proxy+}', [
  api.Str('proxy+', 'path')
], process.env.RATE_LIMIT, ({ proxy }) => api.JsonResponse({ path: proxy }));

module.exports.param = api.wrap('POST param', [
  api.Str('username', 'json'),
  api.Email('email', 'json', false),
  api.Str('ref', 'query', false),
  api.RegEx('notification', '^(1|0)$', 'query', false),
  api.Str('authorizer', 'context', false),
  api.Str('authorizer', 'header', false),
  api.UUID('uuidParam', 'json', false),
  api.List('listParam', 'json', false),
  api.StrList('strListParam', 'json', false),
  api.FieldsParam('fieldsParam', 'id', 'json', false),
  api.NumberList('numberListParam', 'json', false),
  api.GeoPoint('geoPointParam', 'json', false),
  api.GeoRect('geoRectParam', 'json', false),
  api.List('listParam', 'query', false),
  api.StrList('strListParam', 'query', false),
  api.FieldsParam('fieldsParam', 'id', 'query', false),
  api.NumberList('numberListParam', 'query', false),
  api.GeoPoint('geoPointParam', 'query', false),
  api.GeoRect('geoRectParam', 'query', false),
  api.Json('jsonParam', api.Joi.object().required(), 'json', false),
  api.Json('jsonParam', api.Joi.object().required(), 'query', false)
], process.env.RATE_LIMIT, params => api.JsonResponse(params));

module.exports.param2 = api.wrap('POST param2', [
  api.Str('username', 'json', false),
  api.Email('email', 'json', false, { nullable: true }),
  api.Str('X-Custom-Header', 'header', false)
], process.env.RATE_LIMIT, ({
  username = 'default',
  email = 'default',
  xCustomHeader = null
}) => api.JsonResponse({ username, email, xCustomHeader }));

module.exports.internalApi = api;
