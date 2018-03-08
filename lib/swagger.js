const get = require("lodash.get");
const set = require("lodash.set");
const SwaggerParser = require('swagger-parser');

const enforceExact = [
  "swagger",
  "produces",
  "paths.*.*.parameters",
  "paths.*.*.consumes"
].map(e => new RegExp(`^${e.replace(/\./g, "\\.").replace(/\*/g, "[^.]+?")}$`));
const enforceContains = [
  "paths.*.*.description"
].map(e => new RegExp(`^${e.replace(/\./g, "\\.").replace(/\*/g, "[^.]+?")}$`));

const merge = (target, data, hierarchy = []) => {
  const selector = hierarchy.join(".");
  if (enforceExact.some(e => selector.match(e))) {
    set(target, selector, data);
  }
  if (enforceContains.some(e => selector.match(e))) {
    const current = get(target, selector);
    if ((current || "").indexOf(data) === -1) {
      set(target, selector, [current, data].filter(e => e !== undefined).join("\n"));
    }
  }
  if (data instanceof Object) {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i += 1) {
        merge(target, data[i], hierarchy.concat([i]));
      }
    } else {
      Object.keys(data).forEach((key) => {
        merge(target, data[key], hierarchy.concat([key]));
      });
    }
  } else if (get(target, selector) === undefined) {
    set(target, selector, data);
  }
};

module.exports = (endpoints, existing = {}) => {
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
      .map(p => ({
        name: p.name,
        required: p.required,
        type: p.type,
        in: p.position
      }));

    const jsonParams = endpoints[request]
      .filter(p => p.position === "json");
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
