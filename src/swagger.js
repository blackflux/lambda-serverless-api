const get = require('lodash.get');
const difference = require('lodash.difference');
const SwaggerParser = require('swagger-parser');
const objectScan = require('object-scan');
const merge = require('./util/merge')([
  'swagger',
  'produces',
  'paths.*.*.parameters',
  'paths.*.*.consumes'
], [
  'paths.*.*.description'
]);

module.exports = (endpoints, existing) => {
  const data = {
    swagger: '2.0',
    produces: ['application/json'],
    info: {
      title: 'Api Name',
      version: '0.0.1'
    },
    paths: {}
  };
  Object.keys(endpoints).forEach((request) => {
    const parameters = endpoints[request]
      .filter(p => ['json', 'context'].indexOf(p.position) === -1)
      .map(p => Object.assign(
        {
          name: p.nameOriginal,
          required: p.required,
          type: p.type,
          format: p.constructor.name,
          in: p.position
        },
        p.regex === undefined ? {} : { pattern: p.regex.toString() },
        p.items === undefined ? {} : { type: 'string' },
        p.enums === undefined ? {} : {
          type: 'string',
          enum: [...p.enums]
        },
        p.minItemLength === undefined ? {} : { minLength: p.minItemLength },
        p.maxItemLength === undefined ? {} : { maxLength: p.maxItemLength },
        p.minItems === undefined ? {} : { minItems: p.minItems },
        p.maxItems === undefined ? {} : { maxItems: p.maxItems },
        p.min === undefined ? {} : { minimum: p.min },
        p.max === undefined ? {} : { maximum: p.max }
      ));

    const jsonParams = endpoints[request]
      .filter(p => p.position === 'json');
    if (jsonParams.length !== 0) {
      const required = jsonParams.filter(p => p.required).map(p => p.name);
      parameters.push({
        in: 'body',
        name: 'bodyParamData',
        schema: Object.assign(
          {
            type: 'object',
            properties: jsonParams.reduce((prev, p) => Object.assign(prev, {
              [p.name]: Object.assign(
                { type: p.type, format: p.constructor.name },
                p.regex === undefined ? {} : { pattern: p.regex.toString() },
                p.items === undefined ? {} : { items: p.items },
                p.minItems === undefined ? {} : { minItems: p.minItems },
                p.maxItems === undefined ? {} : { maxItems: p.maxItems }
              )
            }), {})
          },
          required.length === 0 ? {} : { required }
        )
      });
    }

    const description = [];
    const contextParams = endpoints[request]
      .filter(p => p.position === 'context')
      .map(p => p.name);
    if (contextParams.length !== 0) {
      description.push(`Internally contexts are used: ${contextParams.join(', ')}`);
    }

    const path = `/${request.split(' ')[1]}`;
    data.paths[path] = Object.assign(get(data.paths, path, {}), {
      [request.split(' ')[0].toLowerCase()]: {
        consumes: ['application/json'],
        description: description.join('\n'),
        parameters,
        responses: {
          default: {
            description: 'Unexpected Error'
          }
        }
      }
    });
  });

  const result = JSON.parse(JSON.stringify(existing));
  const unexpected = difference(objectScan(['paths.*.*'])(result), objectScan(['paths.*.*'])(data));
  if (unexpected.length !== 0) {
    throw new Error(`Unexpected swagger endpoint(s) detected: ${unexpected.join(', ')}`);
  }
  merge(result, data);
  return SwaggerParser.validate(result);
};
