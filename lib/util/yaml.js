const fs = require("fs");
const path = require("path");
const get = require('lodash.get');
const set = require('lodash.set');
const yaml = require('js-yaml');

const loadRecursive = (dir, data) => {
  Object.keys(data).forEach((key) => {
    let entry = get(data, key);
    if (typeof entry === 'string' || entry instanceof String) {
      // replace yaml variables with defaults
      entry = entry.replace(/\${[a-zA-Z0-9]+?:[a-zA-Z0-9]+?, ["']([a-zA-Z0-9]+)["']}/g, "$1");
      // load referenced yaml file
      const match = /^\${file\(([^(){}$]+?)\)(?::([a-zA-Z0-9]*?))?}$/g.exec(entry);
      if (match) {
        const loaded = yaml.safeLoad(fs.readFileSync(path.join(dir, match[1]), 'utf8'));
        entry = loadRecursive(dir, get(loaded, match[2], loaded));
      }
    }
    if (entry instanceof Object) {
      entry = loadRecursive(dir, entry);
    }
    set(data, key, entry);
  });
  return data;
};

module.exports.load = filePath => loadRecursive(
  path.dirname(filePath),
  yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
);
