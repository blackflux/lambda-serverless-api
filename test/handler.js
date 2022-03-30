import request from 'request-promise';
import Joi from 'joi-strict';
import { Api } from '../src/index.js';

const api = Api({
  cors: {
    allowedHeaders: [
      'X-Requested-With',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'X-Amz-User-Agent'
    ],
    allowedOrigins: [
      'https://test.com'
    ]
  },
  logger: {
    redactSuccess: ['event.requestContext.identity.cognito*']
  },
  versioning: {
    sunsetDurationInDays: 7 * 52 * 2,
    forceSunset: process.env.FORCE_SUNSET === '1',
    apiVersionHeader: 'X-Api-Version',
    versions: {
      '1.0.1': '2020-01-01',
      '0.9.0': '2018-01-01',
      '1.0.0': '2019-01-01'
    }
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true'
  },
  preLogic: () => {}
});

const limit = process.env.RATE_LIMIT === undefined
  ? undefined
  : parseInt(process.env.RATE_LIMIT, 10);

export const deprecated = api.wrap('GET deprecated', [], () => {
  const date = new Date();
  const headers = {
    deprecation: `date="${date.toUTCString()}"`,
    sunset: new Date(date.getTime() + (1000 * 60 * 60 * 24 * 7 * 52 * 2)).toUTCString()
  };
  return api.JsonResponse(JSON.parse(JSON.stringify(headers)), 200, headers);
});

export const error = api.wrap('GET error', [], () => {
  throw api.ApiError('Some Error', 400, 2341);
});

export const exception = api.wrap('GET exception', [], { limit: null }, () => {
  throw Error('Some Exception');
});

export const deprecation = api.wrap('GET deprecation', [], {
  deprecated: '1.0.1'
}, () => api.ApiResponse(''));

export const versioning = api.wrap('GET versioning', [], {
  versioning: false
}, () => api.ApiResponse(''));

export const text = api
  .wrap('GET text', [], () => api.ApiResponse('some text', 200, { 'some-header': 123 }));

export const json = api
  .wrap('GET json', [], { limit }, () => api.JsonResponse({ some: 'json' }));

export const echo = api.wrap('GET echo', [
  api.Str('name', 'query')
], { limit }, ({ name }) => api.JsonResponse({ name }));

export const proxy = api.wrap('GET proxy/{proxy+}', [
  api.Str('proxy+', 'path')
], ({ proxy: p }) => api.JsonResponse({ path: p }));

export const param = api.wrap('POST param', [
  api.Str('username', 'json'),
  api.Email('email', 'json', { required: false }),
  api.Str('ref', 'query', { required: false }),
  api.RegEx('notification', 'query', { regex: /^(1|0)$/, required: false }),
  api.Str('authorizer', 'context', { required: false }),
  api.Str('authorizer', 'header', { required: false }),
  api.IsoTimestamp('isoTimestampParam', 'json', { required: false }),
  api.IsoDate('isoDateParam', 'json', { required: false }),
  api.UUID('uuidParam', 'json', { required: false }),
  api.List('listParam', 'json', { required: false }),
  api.StrList('strListParam', 'json', { required: false }),
  api.FieldsParam('fieldsParam', 'json', { required: false, fields: ['id'], autoPrune: null }),
  api.Number('numberParam', 'json', { required: false }),
  api.NumberList('numberListParam', 'json', { required: false }),
  api.Int('number', 'json', { required: false, min: 10, max: 20 }),
  api.Int('number', 'query', { required: false, min: 10, max: 20 }),
  api.IntShort('numberShortParam', 'json', { required: false }),
  api.IntShort('numberShortParam', 'query', { required: false }),
  api.GeoPoly('geoPolyParam', 'json', { required: false }),
  api.GeoPoly('geoPolyParam', 'query', { required: false }),
  api.GeoPolyList('geoPolyListParam', 'query', { required: false }),
  api.GeoPolyList('geoPolyListParam', 'json', { required: false }),
  api.GeoPoint('geoPointParam', 'json', { required: false }),
  api.GeoRect('geoRectParam', 'json', { required: false }),
  api.GeoShape('geoShapeParam', 'json', { required: false }),
  api.List('listParam', 'query', { required: false }),
  api.GeoShapeList('geoShapeListParam', 'json', {
    required: false,
    maxItems: 3,
    minItems: 1
  }),
  api.StrList('strListParam', 'query', {
    required: false,
    enums: ['enum1', 'enum2'],
    minItemLength: 1,
    maxItemLength: 2,
    maxItems: 3,
    minItems: 1
  }),
  api.Enum('enumParam', 'query', {
    required: false,
    enums: ['enum1', 'enum2']
  }),
  api.FieldsParam('fieldsParam', 'query', { required: false, fields: ['id'] }),
  api.Number('numberParam', 'query', { required: false }),
  api.NumberList('numberListParam', 'query', { required: false }),
  api.GeoPoint('geoPointParam', 'query', { required: false }),
  api.GeoRect('geoRectParam', 'query', { required: false }),
  api.GeoShape('geoShapeParam', 'query', { required: false }),
  api.Json('jsonParam', 'json', { required: false, schema: Joi.object() }),
  api.Json('jsonParam', 'query', { required: false, schema: Joi.object() }),
  api.JsonList('jsonListParam', 'json', { required: false, schema: Joi.object() }),
  api.JsonList('jsonListParam', 'query', { required: false, schema: Joi.object() }),
  api.Str('paramWithGetter', 'query', {
    required: false,
    getter: () => request({ uri: 'https://foo.com', json: true })
  })
], (params) => api.JsonResponse(params));

export const param2 = api.wrap('POST param2', [
  api.Str('username', 'json', { required: false }),
  api.Email('email', 'json', { required: false, nullable: true }),
  api.Str('X-Custom-Header', 'header', { required: false })
], ({
  username = 'default',
  email = 'default',
  xCustomHeader = null
}) => api.JsonResponse({ username, email, xCustomHeader }));

export const internalApi = api;

export const pathParam = api.wrap('POST path/{param}', [
  api.Str('param', 'path')
], ({ param: p }) => api.JsonResponse({ param: p }));

export const binary = api.wrap('GET binary', [], () => api.BinaryResponse(Buffer.from('test', 'utf8')));

export const path = api.wrap('GET some/path', [], () => api.JsonResponse({}));

export const options = api.wrap('OPTIONS some/path', [], () => api.ApiResponse(''));

export const router = api.router;
