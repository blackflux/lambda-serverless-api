# Rest Abstraction for Serverless API
 
[![Build Status](https://circleci.com/gh/blackflux/lambda-serverless-api.png?style=shield)](https://circleci.com/gh/blackflux/lambda-serverless-api)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/lambda-serverless-api/master.svg)](https://coveralls.io/github/blackflux/lambda-serverless-api?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/lambda-serverless-api)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/lambda-serverless-api/status.svg)](https://david-dm.org/blackflux/lambda-serverless-api)
[![NPM](https://img.shields.io/npm/v/lambda-serverless-api.svg)](https://www.npmjs.com/package/lambda-serverless-api)
[![Downloads](https://img.shields.io/npm/dt/lambda-serverless-api.svg)](https://www.npmjs.com/package/lambda-serverless-api)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

This project abstracts the creation of a basic API and the most commonly desired features.

Provides support for:

- Parameter Validation and Response Generation
- Generation of [Swagger](https://swagger.io/) Documentation
- Rate Limiting using [lambda-rate-limiter](https://github.com/blackflux/lambda-rate-limiter)
- Logging of ApiErrors using [lambda-monitor-logger](https://github.com/blackflux/lambda-monitor-logger)

## Install

    $ npm install --save lambda-serverless-api

## Getting Started

// TODO: BELOW IS OUTDATED ....


First we need to wrap our lambda endpoint. Inside the lambda function we can then use `ApiError` and `JsonResponse` as following:

<!-- eslint-disable import/no-unresolved -->
```js
const api = require('lambda-serverless-api').Api({/* options */});

module.exports = api.wrap('POST register', [
  api.Str('name', 'json', false),
  api.Email('email', 'json'),
  api.Str('password', 'json')
], /* options, */ ({ name = null, email = null, password = null }, context, event) => {
  // handle registration logic here ...
  if (new Date().getHours() === 4) {
    throw api.ApiError('I am a teapot', 418);
  }
  return api.JsonResponse({ message: 'Success!' });
});

```
where options can contain `limit` which allows overwrite of limit per endpoint. Rate limiting is explained below.

The first `api.wrap` parameter defines the route and is re-declared in `serverless.yml`. 

A list of supported parameters can be found [here](lib/param.js).

If you want to send plain text instead of json, you can use `ApiResponse`. You can also set custom status codes and headers as second and third parameter respectively.

Parameter names are converted to camel case. E.g. `X-Custom-Header` would be passed as `xCustomHeader`.

## Options

All parameter types support the following options:

#### options.nullable

Allow input value to be `null`.<br> 
_Note: Parameter position must be in [json, context]_

Type: `boolean`

Default: `false`

*Example*
<!-- eslint-disable no-undef, no-console -->
```javascript
/* { "name": null } */
module.exports = api.wrap('POST name', [
  api.Str('name', 'json', false, { nullable: true })
], ({ name }) => {
  console.log(name); // null
});
```

#### options.getter

_*Note: only recommended for advanced use cases.*_<br>
Optionally asynchronous custom "getting" of variables.<br>
Getter function takes raw input from event, IE a `query` parameter will always pass String values into the `getter` function.<br>
Warnings:
* If used with `{ nullable: true }`, if a rawInput is passed as `null`, or if a non-required parameter is not sent, the `getter` function will _not_ be used.
* Some params (such as Bool, Int, Json, etc) do extra processing _after_ the `getter` function has returned, and may return inconsistent results. Thorough testing is recommended.

Takes unresolved parameters as second parameter. Simple parameters can be accessed directly, unresolved can be resolved by using `await`.

Type: `Function`

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

## Prefix routes

To prefix routes with a specific path, you can use the `routePrefix` option. This is handy when the api is not
deployed under the domain root. Example `prefix/path/`.

## Default Headers

Can be defined as a static object, or as a function taking in the request headers. This is e.g. useful for 
returning the correct origin for cross origin requests with multiple allowed origins.

Note that the request headers are normalized to lower camel case.

## Swagger Documentation

To generate swagger documentation we can call `api.generateSwagger()` after the api is initialized with routes.

## Custom Error Messages

You can pass an additional `messageId` and `context` to the `ApiError` constructor.
These will be returned with the error response.

## Rate Limiting

Rate limiting uses [lambda-rate-limiter](https://github.com/blackflux/lambda-rate-limiter). Note that there are some serious restrictions because it does not use centralized storage!

To customize rate limiting, the package options are passed as `limiter` into the constructor.

By default rate limiting uses the client ip (`['requestContext.identity.sourceIp']`). This can be customized by using `rateLimitTokenPaths` as an array (evaluated left to right) to target different keys on the lambda event. If rate limit is enabled and no valid rate limit token is detected on an event, an internal exception is thrown. 

## Logging Api Errors / Exceptions

To monitor api errors and exceptions, [lambda-monitor](https://github.com/blackflux/lambda-monitor) should be configured.

## Loading serverless.yml

Consider using [yaml-boost](https://github.com/blackflux/yaml-boost)

Consider using a single router function instead of declaring each function individually.

Example that also keeps lambda function warm:

```yml
functions:
  router:
    handler: lib/handler.router
    events:
      - schedule: rate(10 minutes)
      - http:
          path: /{proxy+}
          method: ANY
```
