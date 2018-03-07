const expect = require('chai').expect;
const api = require("../lib/api")();

describe("Testing Params", () => {
  it("Testing Error for GET And JSON Param", (done) => {
    expect(() => api.wrap("GET route", [api.Str("name", "json")], 1, () => {}))
      .to.throw("Can not use JSON parameter with GET requests.");
    done();
  });

  it("Testing Undefined Path Parameter", (done) => {
    expect(() => api.wrap("GET route/id", [api.Str("id", "path")], 1, () => {}))
      .to.throw("Path Parameter not defined in given path.");
    done();
  });
});
