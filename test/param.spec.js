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
      .to.throw("Invalid Parameter Position");
    done();
  });

  it("Testing UUID param", () => {
    const param = api.UUID("value");
    expect(param.get({
      queryStringParameters: {
        value: "9d09d573-173e-4919-b823-70d406242040"
      }
    })).to.equal("9d09d573-173e-4919-b823-70d406242040");
    expect(() => param.get({
      queryStringParameters: {
        value: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"value\" provided.");
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

  it("Testing Bool Parameter Undefined (json)", () => {
    const param = api.Bool("enabled", "json", false);
    expect(param.get({
      body: {}
    })).to.equal(undefined);
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

  it("Testing Int Parameter Undefined (json)", () => {
    const param = api.Int("value", "json", false);
    expect(param.get({
      body: {}
    })).to.equal(undefined);
  });

  it("Testing List Parameter (query)", () => {
    const param = api.List("list");
    expect(param.get({
      queryStringParameters: {
        list: '["123","345"]'
      }
    })).to.deep.equal(["123", "345"]);
    expect(() => param.get({
      queryStringParameters: {
        list: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"list\" provided.");
  });

  it("Testing List Parameter (json)", () => {
    const param = api.List("list", "json");
    expect(param.get({
      body: {
        list: ["123", 123]
      }
    })).to.deep.equal(["123", 123]);
    expect(() => param.get({
      body: {
        list: {}
      }
    })).to.throw("Invalid Value for json-Parameter \"list\" provided.");
  });

  it("Testing StrList Parameter (query)", () => {
    const param = api.StrList("list");
    expect(param.get({
      queryStringParameters: {
        list: '["123","345"]'
      }
    })).to.deep.equal(["123", "345"]);
    expect(() => param.get({
      queryStringParameters: {
        list: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"list\" provided.");
  });

  it("Testing StrList Parameter (json)", () => {
    const param = api.StrList("list", "json");
    expect(param.get({
      body: {
        list: ["123", "345"]
      }
    })).to.deep.equal(["123", "345"]);
    expect(() => param.get({
      body: {
        list: ["123", 213]
      }
    })).to.throw("Invalid Value for json-Parameter \"list\" provided.");
  });

  it("Testing NumberList Parameter (query)", () => {
    const param = api.NumberList("list");
    expect(param.get({
      queryStringParameters: {
        list: '[123.123,345.234]'
      }
    })).to.deep.equal([123.123, 345.234]);
    expect(() => param.get({
      queryStringParameters: {
        list: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"list\" provided.");
  });

  it("Testing NumberList Parameter (json)", () => {
    const param = api.NumberList("list", "json");
    expect(param.get({
      body: {
        list: [123.123, 345.234]
      }
    })).to.deep.equal([123.123, 345.234]);
    expect(() => param.get({
      body: {
        list: ["123", 213]
      }
    })).to.throw("Invalid Value for json-Parameter \"list\" provided.");
  });

  it("Testing Json Parameter (query)", () => {
    const param = api.Json("param");
    expect(param.get({
      queryStringParameters: {
        param: '{"key": "value"}'
      }
    })).to.deep.equal({ key: "value" });
    expect(() => param.get({
      queryStringParameters: {
        param: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"param\" provided.");
  });

  it("Testing Json Parameter (json)", () => {
    const param = api.Json("param", "json");
    expect(param.get({
      body: {
        param: { key: "value" }
      }
    })).to.deep.equal({ key: "value" });
    expect(() => param.get({
      body: {
        param: "string"
      }
    })).to.throw("Invalid Value for json-Parameter \"param\" provided.");
  });

  it("Testing Path Parameter (query)", () => {
    const param = api.PathParam("param", ["id", "user.id", "user.name"]);
    expect(param.get({
      queryStringParameters: {
        param: 'id,user.id,user.name'
      }
    })).to.deep.equal("id,user.id,user.name");
    expect(() => param.get({
      queryStringParameters: {
        param: "invalid"
      }
    })).to.throw("Invalid Value for query-Parameter \"param\" provided.");
  });

  it("Testing Path Parameter (json)", () => {
    const param = api.PathParam("param", "id,user(id,name)", "json");
    expect(param.get({
      body: {
        param: "id,user.id,user.name"
      }
    })).to.deep.equal("id,user.id,user.name");
    expect(() => param.get({
      body: {
        param: "invalid"
      }
    })).to.throw("Invalid Value for json-Parameter \"param\" provided.");
  });
});
