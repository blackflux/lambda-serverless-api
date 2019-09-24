const path = require('path');
const Joi = require('joi-strict');
const { Module } = require('./logic/module');
const { Router } = require('./logic/router');
const { Wrapper } = require('./logic/wrapper');
const swagger = require('./logic/swagger');
const param = require('./param');
const response = require('./response');
const mergeSchemas = require('./util/merge-schemas');

const Api = (options = {}) => {
  const module = new Module(path.join(__dirname, 'plugin'), options);
  Joi.assert(options, mergeSchemas(module.getSchemas()));

  const router = Router({ module });
  const wrapper = Wrapper({ router, module });

  return {
    wrap: wrapper.wrap,
    router: router.handler,
    generateSwagger: () => swagger({ wrapper }),
    ...response,
    ...param
  };
};

module.exports = {
  Api,
  ...response,
  ...param
};
