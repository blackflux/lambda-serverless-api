const request = require('request-promise');
const api = require('./../src/api').Api({
  preflightCheck: ({
    origin, allowedMethods, accessControlRequestMethod, accessControlRequestHeaders
  }) => {
    const allowedHeaders = [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'X-Amz-User-Agent'
    ].map(h => h.toLowerCase());
    const allowedOrigins = [
      'https://test.com'
    ];

    if (!allowedMethods.includes(accessControlRequestMethod)) {
      return false;
    }
    if (!accessControlRequestHeaders.split(',').map(h => h
      .trim().toLowerCase()).every(h => allowedHeaders.includes(h))) {
      return false;
    }
    if (!allowedOrigins.includes(origin)) {
      return false;
    }

    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': allowedHeaders.join(','),
      'Access-Control-Allow-Methods': allowedMethods.join(',')
    };
  }
});

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
  api.IsoDate('isoDateParam', 'json', false),
  api.UUID('uuidParam', 'json', false),
  api.List('listParam', 'json', false),
  api.StrList('strListParam', 'json', false),
  api.Number('numberParam', {}, 'json', false),
  api.NumberList('numberListParam', 'json', false),
  api.GeoPoint('geoPointParam', 'json', false),
  api.GeoRect('geoRectParam', 'json', false),
  api.GeoShape('geoShapeParam', {}, 'json', false),
  api.List('listParam', 'query', false),
  api.StrList('strListParam', 'query', false),
  api.FieldsParam('fieldsParam', 'id', 'query', false),
  api.Number('numberParam', {}, 'query', false),
  api.NumberList('numberListParam', 'query', false),
  api.GeoPoint('geoPointParam', 'query', false),
  api.GeoRect('geoRectParam', 'query', false),
  api.GeoShape('geoShapeParam', {}, 'query', false),
  api.Json('jsonParam', api.Joi.object().required(), 'json', false),
  api.Json('jsonParam', api.Joi.object().required(), 'query', false),
  api.Str('paramWithGetter', 'query', false, { getter: () => request({ uri: 'https://foo.com', json: true }) })
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

module.exports.pathParam = api.wrap('POST path/{param}', [
  api.Str('param', 'path')
], process.env.RATE_LIMIT, ({ param }) => api.JsonResponse({ param }));

module.exports.path = api.wrap('GET some/path', [], process.env.RATE_LIMIT, () => api.JsonResponse({}));

module.exports.router = api.router;
