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
- Logging of ApiErrors using [lambda-rollbar](https://github.com/blackflux/lambda-rollbar)

## Install

    $ npm install --save lambda-serverless-api

## Getting Started

First we need to wrap our lambda endpoint. Inside the lambda function we can then use `ApiError` and `JsonResponse` as following:

<!-- eslint-disable import/no-unresolved -->
```js
const api = require('lambda-serverless-api').Api({
  limit: 100, // default limit for routes
  limiter: {},
  rollbar: {},
  defaultHeaders: {},
  preflightCheck: () => false,
  preRequestHook: (event, context, rb) => {
    // log or throw error here
  }
});

module.exports = api.wrap('POST register', [
  api.Str('name', 'json', false),
  api.Email('email', 'json'),
  api.Str('password', 'json')
], /* options, */ ({ name = null, email = null, password = null }, context, rb, event) => {
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

The `defaultHeaders` are returned with every request that isn't an unexpected crash. This is handy if you are planning to set up Access headers.

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

## Preflight Requests

When the API is exposed to web clients one needs to deal with preflight 
"OPTIONS" requests. By default all OPTIONS requests are denied. To 
customize this one needs to overwrite the `preflightCheck` option.

An example implementation of this can be found in `test/handler.js`.
The response is expected to be an object on success and otherwise false.
The object is expected to contains all headers that should be returned. 
The parameters passed into the function are 
`origin, allowedMethods, accessControlRequestMethod, accessControlRequestHeaders, path`.

## Prefix routes

To prefix routes with a specific path, you can use the `routePrefix` option. This is handy when the api is not
deployed under the domain root. Example `prefix/path/`.

## Default Headers

Can be defined as a static object, or as a function taking in the request headers. This is e.g. useful for 
returning the correct origin for cross origin requests with multiple allowed origins.

Note that the request headers are normalized to lower camel case.

## Pre Request Hook

Can define a `preRequestHook` function. This can be used to log events or throw api errors generically.

Takes parameters `event` (raw lambda function event), `context` (raw lambda function context) and `rb` (rollbar logger).

## Swagger Documentation

To generate swagger documentation we can call `api.generateSwagger()` after the api is initialized with routes.

## Custom Error Messages

You can pass an additional `messageId` and `context` to the `ApiError` constructor.
These will be returned with the error response.

## Rate Limiting

Rate limiting uses [lambda-rate-limiter](https://github.com/blackflux/lambda-rate-limiter). Note that there are some serious restrictions because it does not use centralized storage!

To customize rate limiting, the package options are passed as `limiter` into the constructor.

## Logging Api Errors / Exceptions

To monitor api errors and exceptions [lambda-rollbar](https://github.com/blackflux/lambda-rollbar) can be enabled. Options are passed by putting them as `rollbar` into the constructor.

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
