[![Build Status](https://img.shields.io/travis/simlu/lambda-serverless-api/master.svg)](https://travis-ci.org/simlu/lambda-serverless-api)
[![Test Coverage](https://img.shields.io/coveralls/simlu/lambda-serverless-api/master.svg)](https://coveralls.io/github/simlu/lambda-serverless-api?branch=master)
[![Greenkeeper Badge](https://badges.greenkeeper.io/simlu/lambda-serverless-api.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/simlu/lambda-serverless-api/status.svg)](https://david-dm.org/simlu/lambda-serverless-api)
[![NPM](https://img.shields.io/npm/v/lambda-serverless-api.svg)](https://www.npmjs.com/package/lambda-serverless-api)
[![Downloads](https://img.shields.io/npm/dt/lambda-serverless-api.svg)](https://www.npmjs.com/package/lambda-serverless-api)
[![Semantic-Release](https://github.com/simlu/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)
[![Gitter](https://github.com/simlu/js-gardener/blob/master/assets/icons/gitter.svg)](https://gitter.im/simlu/lambda-serverless-api)

# Abstraction for Serverless API 

This project abstracts the creation of a basic API and the most commonly desired features.

Provides support for:

- Parameter Validation and Response Generation
- Generation of [Swagger](https://swagger.io/) Documentation
- Rate Limiting using [lambda-rate-limiter](https://github.com/simlu/lambda-rate-limiter)
- Logging of ApiErrors using [lambda-rollbar](https://github.com/simlu/lambda-rollbar)

## Install

    $ npm install --save lambda-serverless-api

## Getting Started

First we need to wrap our lambda endpoint. Inside the lambda function we can then use `ApiError` and `JsonResponse` as following:

<!-- eslint-disable import/no-unresolved -->
```js
const api = require("lambda-serverless-api")({
  limiter: {},
  rollbar: {},
  defaultHeaders: {}
});

module.exports = api.wrap("POST register", [
  api.Str("name", "json", false),
  api.Email("email", "json"),
  api.Str("password", "json")
], process.env.RATE_LIMIT_PER_IP, ([name, email, password], context, rb) => {
  // handle registration logic here ...
  if (new Date().getHours() === 4) {
    throw api.ApiError("I am a teapot", 418);
  }
  return api.JsonResponse({ message: "Success!" });
});

```
where `RATE_LIMIT_PER_IP` allows to set different limits per endpoint. Rate limiting is explained below.

The first `api.wrap` parameter defines the route and is re-declared in `serverless.yml`. 

A list of supported parameters can be found [here](lib/param.js).

If you want to send plain text instead of json, you can use `ApiResponse`. You can also set custom status codes and headers as second and third parameter respectively.

## Swagger Documentation

To generate swagger documentation we can call `api.generateSwagger()` after the api is initialized with routes.

To validate that your swagger documentation matches your `serverless.yml` you can run `api.generateDifference()`.

Examples can be found [here](test/test_swagger.js).

## Custom Error Messages

You can pass an additional `messageId` and `context` to the `ApiError` constructor.
These will be returned with the error response.

## Rate Limiting

Rate limiting uses [lambda-rate-limiter](https://github.com/simlu/lambda-rate-limiter). Note that there are some serious restrictions because it does not use centralized storage!

To customize rate limiting, the package options are passed as `limiter` into the constructor.

## Logging Api Errors / Exceptions

To monitor api errors and exceptions [lambda-rollbar](https://github.com/simlu/lambda-rollbar) can be enabled. Options are passed by putting them as `rollbar` into the constructor.

## Loading serverless.yml

Consider using [yaml-boost](https://github.com/simlu/yaml-boost)
