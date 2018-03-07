const SwaggerParser = require('swagger-parser');

module.exports = (endpoints) => {
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
    const parameters = endpoints[request].filter(p => p.position !== "json").map(p => ({
      name: p.name,
      required: p.required,
      type: p.type,
      in: p.position
    }));

    const jsonParams = endpoints[request].filter(p => p.position === "json");
    if (jsonParams.length !== 0) {
      parameters.push({
        in: "body",
        name: "bodyParamData",
        schema: {
          type: "object",
          required: jsonParams.filter(p => p.required).map(p => p.name),
          properties: jsonParams.reduce((prev, p) => Object.assign(prev, {
            [p.name]: {
              type: p.type
            }
          }), {})
        }
      });
    }
    data.paths[`/${request.split(" ")[1]}`] = {
      [request.split(" ")[0].toLowerCase()]: {
        consumes: ["application/json"],
        parameters,
        responses: {
          default: {
            description: "Unexpected Error"
          }
        }
      }
    };
  });
  return SwaggerParser.validate(data);
};
