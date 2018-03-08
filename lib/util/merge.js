const get = require("lodash.get");
const set = require("lodash.set");

module.exports = (exact, contains) => {
  const enforceExact = exact
    .map(e => new RegExp(`^${e.replace(/\./g, "\\.").replace(/\*/g, "[^.]+?")}$`));
  const enforceContains = contains
    .map(e => new RegExp(`^${e.replace(/\./g, "\\.").replace(/\*/g, "[^.]+?")}$`));

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

  return merge;
};
