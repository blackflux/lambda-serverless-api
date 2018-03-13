const fs = require("fs");
const path = require("path");
const get = require('lodash.get');
const set = require('lodash.set');
const yaml = require('js-yaml');

const loadRecursive = (dir, data, vars) => {
  Object.keys(data).forEach((key) => {
    let entry = get(data, key);
    if (typeof entry === 'string' || entry instanceof String) {
      // replace yaml variables with defaults
      entry = entry.replace(/\${opt:([a-zA-Z0-9]+?)(?:, ["']([a-zA-Z0-9]+?)["'])?}/g, (_, k, v) => get(vars, k, v));
      // load referenced yaml file
      const match = /^\${file\((~?[a-zA-Z0-9._\-/]+?)\)(?::([a-zA-Z0-9.]+?))?}$/g.exec(entry);
      if (match) {
        const filePath = path.join(dir, match[1]);
        const loaded = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
        entry = loadRecursive(dir, match[2] ? get(loaded, match[2]) : loaded, vars);
      }
    }
    if (entry instanceof Object) {
      entry = loadRecursive(dir, entry, vars);
    }
    set(data, key, entry);
  });
  return data;
};

module.exports.load = (filePath, vars = {}) => loadRecursive(
  path.dirname(filePath),
  yaml.safeLoad(fs.readFileSync(filePath, 'utf8')),
  vars
);
