const expect = require('chai').expect;
const api = require("../lib/api")();

describe("Testing Params", () => {
  it("Testing Error for GET And JSON Param", (done) => {
    expect(() => api.wrap("GET route", [api.Str("name", "json")], 1))
      .to.throw("Can not use JSON parameter with GET requests.");
    done();
  });

  it("Testing Undefined Path Parameter", (done) => {
    expect(() => api.wrap("GET route/{otherId}", [api.Str("id", "path")], 1))
      .to.throw("Path Parameter not defined in given path.");
    done();
  });

  it("Testing Unknown Parameter Position", (done) => {
    expect(() => api.wrap("GET route", [api.Str("id", "unknown")], 1))
      .to.throw("Parameter Position needs to be one of: query, json, path, header, context");
    done();
  });

  it("Testing Bool Parameter", () => {
    const param = api.Bool("enabled");
    expect(param.get({
      queryStringParameters: {
        enabled: "true"
      }
    })).to.equal(true);
    expect(param.get({
      queryStringParameters: {
        enabled: "false"
      }
    })).to.equal(false);
  });
});
