const get = require('lodash.get');
const SwaggerParser = require('swagger-parser');

module.exports = ({ wrapper }) => {
  const { endpoints } = wrapper;
  const data = {
    swagger: '2.0',
    produces: ['application/json'],
    info: {
      title: 'Api Name',
      version: '0.0.1'
    },
    paths: {}
  };
  Object.keys(endpoints).forEach((route) => {
    const parameters = endpoints[route]
      .filter((p) => ['json', 'context'].indexOf(p.position) === -1)
      .map((p) => ({
        name: p.nameOriginal,
        required: p.required,
        type: p.type,
        format: p.constructor.name,
        in: p.position,
        ...(p.regex === undefined ? {} : { pattern: p.regex.toString() }),
        ...(p.items === undefined ? {} : { type: 'string' }),
        ...(p.enums === undefined ? {} : {
          type: 'string',
          enum: [...p.enums]
        }),
        ...(p.minItemLength === undefined ? {} : { minLength: p.minItemLength }),
        ...(p.maxItemLength === undefined ? {} : { maxLength: p.maxItemLength }),
        ...(p.minItems === undefined ? {} : { minItems: p.minItems }),
        ...(p.maxItems === undefined ? {} : { maxItems: p.maxItems }),
        ...(p.min === undefined ? {} : { minimum: p.min }),
        ...(p.max === undefined ? {} : { maximum: p.max })
      }));

    const jsonParams = endpoints[route]
      .filter((p) => p.position === 'json');
    if (jsonParams.length !== 0) {
      const required = jsonParams.filter((p) => p.required).map((p) => p.name);
      parameters.push({
        in: 'body',
        name: 'bodyParamData',
        schema: {
          type: 'object',
          properties: jsonParams.reduce((prev, p) => Object.assign(prev, {
            [p.name]: {
              type: p.type,
              format: p.constructor.name,
              ...(p.regex === undefined ? {} : { pattern: p.regex.toString() }),
              ...(p.items === undefined ? {} : { items: p.items }),
              ...(p.minItems === undefined ? {} : { minItems: p.minItems }),
              ...(p.maxItems === undefined ? {} : { maxItems: p.maxItems })
            }
          }), {}),
          ...(required.length === 0 ? {} : { required })
        }
      });
    }

    const description = [];
    const contextParams = endpoints[route]
      .filter((p) => p.position === 'context')
      .map((p) => p.name);
    if (contextParams.length !== 0) {
      description.push(`Internally contexts are used: ${contextParams.join(', ')}`);
    }

    const path = `/${route.split(' ')[1]}`;
    data.paths[path] = Object.assign(get(data.paths, path, {}), {
      [route.split(' ')[0].toLowerCase()]: {
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

  return SwaggerParser.validate(data);
};
