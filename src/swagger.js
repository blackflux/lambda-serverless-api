const SwaggerParser = require('swagger-parser');

const merge = require("./util/merge")([
  "swagger",
  "produces",
  "paths.*.*.parameters",
  "paths.*.*.consumes"
], [
  "paths.*.*.description"
]);

module.exports = (endpoints, existing) => {
  const data = {
    swagger: "2.0",
    produces: ["application/json"],
    info: {
      title: "Api Name",
      version: "0.0.1"
    },
    paths: {}
  };
  Object.keys(endpoints).forEach((request) => {
    const parameters = endpoints[request]
      .filter(p => ["json", "context"].indexOf(p.position) === -1)
      .map(p => Object.assign(
        {
          name: p.name,
          required: p.required,
          type: p.type,
          format: p.constructor.name,
          in: p.position
        },
        p.regex === undefined ? {} : { pattern: p.regex.toString() }
      ));

    const jsonParams = endpoints[request]
      .filter(p => p.position === "json");
    if (jsonParams.length !== 0) {
      const required = jsonParams.filter(p => p.required).map(p => p.name);
      parameters.push({
        in: "body",
        name: "bodyParamData",
        schema: Object.assign(
          {
            type: "object",
            properties: jsonParams.reduce((prev, p) => Object.assign(prev, {
              [p.name]: Object.assign({
                type: p.type,
                format: p.constructor.name
              }, p.regex === undefined ? {} : {
                pattern: p.regex.toString()
              })
            }), {})
          },
          required.length === 0 ? {} : { required }
        )
      });
    }

    const description = [];
    const contextParams = endpoints[request]
      .filter(p => p.position === "context")
      .map(p => p.name);
    if (contextParams.length !== 0) {
      description.push(`Internally contexts are used: ${contextParams.join(", ")}`);
    }

    data.paths[`/${request.split(" ")[1]}`] = {
      [request.split(" ")[0].toLowerCase()]: {
        consumes: ["application/json"],
        description: description.join("\n"),
        parameters,
        responses: {
          default: {
            description: "Unexpected Error"
          }
        }
      }
    };
  });

  const result = JSON.parse(JSON.stringify(existing));
  merge(result, data);
  return SwaggerParser.validate(result);
};
