const get = require("lodash.get");
const set = require("lodash.set");
const defaultsdeep = require("lodash.defaultsdeep");
const objectScan = require("object-scan");

module.exports = (exact, contains) => {
  const findExact = objectScan(exact);
  const findContains = objectScan(contains);

  return (target, data) => {
    defaultsdeep(target, data);
    findExact(data).forEach(m => set(target, m, get(data, m)));
    findContains(data).forEach((m) => {
      const current = get(target, m);
      const shouldContain = get(data, m);
      if ((current || "").indexOf(shouldContain) === -1) {
        set(target, m, [current, shouldContain].filter(e => e !== undefined).join("\n"));
      }
    });
  };
};
