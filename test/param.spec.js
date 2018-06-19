const expect = require('chai').expect;
const api = require("../src/api")();

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

  it("Testing Bool Parameter (query)", () => {
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
    expect(() => param.get({
      queryStringParameters: {
        enabled: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"enabled\" provided.");
  });

  it("Testing Bool Parameter (json)", () => {
    const param = api.Bool("enabled", "json");
    expect(param.get({
      body: {
        enabled: true
      }
    })).to.equal(true);
    expect(param.get({
      body: {
        enabled: false
      }
    })).to.equal(false);
    expect(() => param.get({
      body: {
        enabled: 1
      }
    })).to.throw("Invalid Value for json-Parameter \"enabled\" provided.");
  });

  it("Testing Int Parameter (query)", () => {
    const param = api.Int("value");
    expect(param.get({
      queryStringParameters: {
        value: "-43"
      }
    })).to.equal(-43);
    expect(() => param.get({
      queryStringParameters: {
        value: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"value\" provided.");
  });

  it("Testing Int Parameter (json)", () => {
    const param = api.Int("value", "json");
    expect(param.get({
      body: {
        value: -43
      }
    })).to.equal(-43);
    expect(() => param.get({
      body: {
        value: "invalid"
      }
    })).to.throw("Invalid Value for json-Parameter \"value\" provided.");
  });
});
