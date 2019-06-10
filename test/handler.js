const request = require('request-promise');
const api = require('./../src/index').Api({
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

module.exports.error = api.wrap('GET error', [], () => {
  throw api.ApiError('Some Error', 400, 2341);
});

module.exports.exception = api.wrap('GET exception', [], { limit: null }, () => {
  throw Error('Some Exception');
});

module.exports.text = api.wrap('GET text', [], () => api.ApiResponse('some text'));

module.exports.json = api
  .wrap('GET json', [], { limit: process.env.RATE_LIMIT }, () => api.JsonResponse({ some: 'json' }));

module.exports.proxy = api.wrap('GET proxy/{proxy+}', [
  api.Str('proxy+', 'path')
], ({ proxy }) => api.JsonResponse({ path: proxy }));

module.exports.param = api.wrap('POST param', [
  api.Str('username', 'json'),
  api.Email('email', 'json', { required: false }),
  api.Str('ref', 'query', { required: false }),
  api.RegEx('notification', 'query', { regex: /^(1|0)$/, required: false }),
  api.Str('authorizer', 'context', { required: false }),
  api.Str('authorizer', 'header', { required: false }),
  api.IsoDate('isoDateParam', 'json', { required: false }),
  api.UUID('uuidParam', 'json', { required: false }),
  api.List('listParam', 'json', { required: false }),
  api.StrList('strListParam', 'json', { required: false }),
  api.FieldsParam('fieldsParam', 'json', { required: false, fields: 'id', autoPrune: null }),
  api.Number('numberParam', 'json', { required: false }),
  api.NumberList('numberListParam', 'json', { required: false }),
  api.GeoPoint('geoPointParam', 'json', { required: false }),
  api.GeoRect('geoRectParam', 'json', { required: false }),
  api.GeoShape('geoShapeParam', 'json', { required: false }),
  api.List('listParam', 'query', { required: false }),
  api.StrList('strListParam', 'query', {
    required: false,
    enums: ['enum1', 'enum2'],
    minItemLength: 1,
    maxItemLength: 2,
    maxItems: 3,
    minItems: 1
  }),
  api.FieldsParam('fieldsParam', 'query', { required: false, fields: 'id' }),
  api.Number('numberParam', 'query', { required: false }),
  api.NumberList('numberListParam', 'query', { required: false }),
  api.GeoPoint('geoPointParam', 'query', { required: false }),
  api.GeoRect('geoRectParam', 'query', { required: false }),
  api.GeoShape('geoShapeParam', 'query', { required: false }),
  api.Json('jsonParam', 'json', { required: false, schema: api.Joi.object() }),
  api.Json('jsonParam', 'query', { required: false, schema: api.Joi.object() }),
  api.Str('paramWithGetter', 'query', {
    required: false,
    getter: () => request({ uri: 'https://foo.com', json: true })
  })
], params => api.JsonResponse(params));

module.exports.param2 = api.wrap('POST param2', [
  api.Str('username', 'json', { required: false }),
  api.Email('email', 'json', { required: false, nullable: true }),
  api.Str('X-Custom-Header', 'header', { required: false })
], ({
  username = 'default',
  email = 'default',
  xCustomHeader = null
}) => api.JsonResponse({ username, email, xCustomHeader }));

module.exports.internalApi = api;

module.exports.pathParam = api.wrap('POST path/{param}', [
  api.Str('param', 'path')
], ({ param }) => api.JsonResponse({ param }));

module.exports.path = api.wrap('GET some/path', [], () => api.JsonResponse({}));

module.exports.router = api.router;
