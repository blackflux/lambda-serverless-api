const fs = require("fs");
const path = require("path");
const get = require('lodash.get');
const set = require('lodash.set');
const yaml = require('js-yaml');

const loadRecursive = (dir, data, vars) => {
  let result = data;
  if (typeof result === 'string' || result instanceof String) {
    // replace yaml variables with defaults
    result = result.replace(/\${opt:([a-zA-Z0-9]+?)(?:, ["']([a-zA-Z0-9]+?)["'])?}/g, (_, k, v) => get(vars, k, v));
    // load referenced yaml file
    const match = /^\${file\((~?[a-zA-Z0-9._\-/]+?)\)(?::([a-zA-Z0-9.]+?))?}$/g.exec(result);
    if (match) {
      const filePath = path.join(dir, match[1]);
      const loaded = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
      result = loadRecursive(dir, match[2] ? get(loaded, match[2]) : loaded, vars);
    }
  }
  if (result instanceof Object) {
    Object.keys(result).forEach(key => set(result, key, loadRecursive(dir, get(result, key), vars)));
  }
  return result;
};

module.exports.load = (filePath, vars = {}) => loadRecursive(
  path.dirname(filePath),
  yaml.safeLoad(fs.readFileSync(filePath, 'utf8')),
  vars
);
