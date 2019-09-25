# Rest Abstraction for Serverless API
 
[![Build Status](https://circleci.com/gh/blackflux/lambda-serverless-api.png?style=shield)](https://circleci.com/gh/blackflux/lambda-serverless-api)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/lambda-serverless-api/master.svg)](https://coveralls.io/github/blackflux/lambda-serverless-api?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/lambda-serverless-api)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/lambda-serverless-api/status.svg)](https://david-dm.org/blackflux/lambda-serverless-api)
[![NPM](https://img.shields.io/npm/v/lambda-serverless-api.svg)](https://www.npmjs.com/package/lambda-serverless-api)
[![Downloads](https://img.shields.io/npm/dt/lambda-serverless-api.svg)](https://www.npmjs.com/package/lambda-serverless-api)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Middleware for AWS Lambda and Api Gateway.

Provides support for:

- Fully customizable parameter types
- Support for `header`, `json`, `query` and `context`, parameter positions
- Abstraction for `text`, `json`, and `binary` response types
- Full support for custom authentication
- Full support for `cors`
- Automatic generation of [Swagger](https://swagger.io/) documentation
- Rate limiting using [lambda-rate-limiter](https://github.com/blackflux/lambda-rate-limiter)
- Access and error logging using [lambda-monitor](https://github.com/blackflux/lambda-monitor)

## Install

    $ npm install --save lambda-serverless-api

## Getting Started

Define api and handlers in `handler.js` as follows:

<!-- eslint-disable import/no-unresolved -->
```js
const api = require('lambda-serverless-api').Api({/* options */});

api.wrap('POST register', [
  api.Str('name', 'json', { required: false }),
  api.Email('email', 'json'),
  api.Str('password', 'json')
], /* options, */ ({ name, email, password }) => {
  // handle registration logic here ...
  if (new Date().getHours() === 4) {
    throw api.ApiError('I am a teapot', 418);
  }
  return api.JsonResponse({ message: 'Success!' });
});

module.exports = api;

```

then hook the router endpoint into the [Serverless Framework](https://serverless.com/) configuration as

```yaml
functions:
  router:
    handler: handler.router
    events:
      - schedule: rate(10 minutes)
      - http:
          path: /{proxy+}
          method: ANY
```

## Api Options

The api is plugin based and all options are tied to plugins. The following plugins are customizable:

- _cors_: Used to handle CORS Option requests as well as injecting CORS headers into responses
- _logger_: Log responses to console (CloudWatch), which can then be picked up by `lambda-monitor`
- _preValidation_: Hook to allow pre-validation (e.g. authentication)
- _rateLimit_: Used for rate limiting 
- _router_: Used to modify the router, e.g. set a custom route prefix

Please see implementation for details.

## Endpoint Definition: wrap()

Takes the following positional arguments:
- _route_ `string`: The method and the uri of the format `${method} ${uri}`
- _params_ `Array<Parameter>`: [Parameter definitions](#api-parameters)
- _options_: Endpoint options (optional)
- _handler_ `function`: The handler using [parsed parameters](#parameter-names) as the first argument

Note: The (slightly modified) original event and context can be accessed as additional handler parameters

## Api Parameters

There are various pre-defined parameters available

- _Bool_: Boolean input
- _Date_: Date input as `YYYY-MM-DD`
- _Email_: Email input
- _Enum_: Enum input
- _FieldsParam_: String input that gets parsed as [object-fields](https://github.com/blackflux/object-fields)
- _GeoPoint_: GPS coordinate input
- _GeoRect_: GPS coordinate rectangle input
- _GeoShape_: GPS coordinate polygon input
- _Int_: Integer input
- _IsoDate_: Iso date input
- _Json_: Json input that has to conform to Joi schema
- _List_: List input
- _NumberList_: Number list input
- _NumberParam_: Number input
- _Regex_: String input that has to conform to a regex
- _Str_: String input
- _StrList_: String list input
- _UUID_: Uuid input

### Parameter Types

There are four types of parameter types:
- `json`: parsed from the json request body
- `query`: parsed from the query string
- `header`: parsed from the header and case insensitive
- `context`: parsed from the lambda event context. Useful to e.g. obtain the client IP

### Parameter Options

Below are the default parameter options. Most parameters have several customization options. Please see implementation for details.

#### required

Allow input to be not present

Type: `boolean`<br>
Default: `true`

#### nullable

Allow input value to be `null`.<br> 
_Note: Parameter position must be in [json, context]_

Type: `boolean`<br>
Default: `false`

#### getter

> _Experimental_

_*Note: only recommended for advanced use cases.*_<br>
Optionally asynchronous custom "getting" of variables.<br>
Getter function takes raw input from event, IE a `query` parameter will always pass String values into the `getter` function.<br>
Warnings:
* If used with `{ nullable: true }`, if a rawInput is passed as `null`, or if a non-required parameter is not sent, the `getter` function will _not_ be used.
* Some params (such as Bool, Int, Json, etc) do extra processing _after_ the `getter` function has returned, and may return inconsistent results. Thorough testing is recommended.

Takes unresolved parameters as second parameter. Simple parameters can be accessed directly, unresolved can be resolved by using `await`.

Type: `Function`<br>
Default: `null`

*Example*
<!-- eslint-disable no-undef, no-console -->
```javascript
/* { "name": "  John   "} */
module.exports = api.wrap('POST name', [
  api.Str('name', 'json', true, { getter: (input, params) => input.trim() })
], ({ name }) => {
  console.log(name); // "John"
});
```

### Parameter Names

Parameter names are converted to camel case when passed into the handler.

E.g. the header `X-Custom-Header` would be passed as `xCustomHeader`.

## Api Response

There are two types of api responses: Success and error responses. Error responses need to be thrown, while success responses
need to be returned from the endpoint handler. The following responses are available:

- _Success_: `ApiResponse` (e.g. for plain text), `JsonResponse` (for json), `BinaryResponse` (e.g. for images)
- _Failure_: `ApiError`

Success responses take the positional parameters `data` (required), `statusCode` (optional) and `headers` (optional).

Error responses take the positional parameters `message` (required), `statusCode` (optional), `messageId` (optional) and `context` (optional). They are always of Json format. It is recommended that an easily identifiable messageId is set on all error responses.

Please see implementation for details.

## Rate Limiting

Done globally through the API configuration. However can be overwritten on a per-endpoint basis
by specifying `limit` as an integer in the endpoint definition option.

Rate limiting uses [lambda-rate-limiter](https://github.com/blackflux/lambda-rate-limiter). Note that there are some serious restrictions because it does not use centralized storage!

By default the client IP (`['requestContext.identity.sourceIp']`) is used for rate limiting. However this can be customized.

## General Notes

Each endpoint definition can also be exposed as a separate lambda function. However this is not recommended for
larger APIs due to CloudFormation limitations (maximum number of resources and stack invalidation issues). 

Consider using [yaml-boost](https://github.com/blackflux/yaml-boost) for loading Serverless Framework configuration.

Consider using a single router function instead of declaring each function individually.

## Swagger Documentation

To generate swagger documentation we can call `api.generateSwagger()` after the api is initialized with routes. For merge-overwrite the swagger definition [fs.smartWrite()](https://github.com/blackflux/smart-fs) can be used.

_Example_

<!-- eslint-disable import/no-extraneous-dependencies,no-undef -->
```js
const fs = require('smart-fs');
const path = require('path');

const updateSwagger = async () => {
  const swaggerFile = path.join(__dirname, '..', 'swagger.yml');
  const swaggerContent = await api.generateSwagger();
  const result = fs.smartWrite(swaggerFile, swaggerContent);
  expect(result, 'Swagger file updated').to.equal(false);
};
updateSwagger();
```

## Logging Api Errors / Exceptions

To monitor api errors and exceptions, [lambda-monitor](https://github.com/blackflux/lambda-monitor) should be configured with rollbar.
