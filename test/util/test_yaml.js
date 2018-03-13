const expect = require('chai').expect;
const path = require("path");
const yaml = require("./../../lib/util/yaml");

const parentFile = path.join(__dirname, "yaml", 'parent.yml');

describe("Testing Yaml", () => {
  it("Testing Load - Undefined Variable", () => {
    expect(yaml.load(parentFile)).to.deep.equal({
      parent: { v1: 'undefined', v2: 'default' },
      raw: { subParent: { v1: 'undefined', v2: 'default' } }
    });
  });

  it("Testing Load - Provided Variable", () => {
    expect(yaml.load(parentFile, { test: "info" })).to.deep.equal({
      parent: { v1: 'info', v2: 'info' },
      raw: { subParent: { v1: 'info', v2: 'info' } }
    });
  });

  it("Testing Load - Invalid File Reference", () => {
    expect(() => yaml.load(parentFile, { child: "unknown" }))
      .to.throw(`ENOENT: no such file or directory, open '${path.join(path.dirname(parentFile), "unknown.yml")}'`);
  });
});
