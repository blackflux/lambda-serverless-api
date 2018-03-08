const fs = require("fs");
const path = require("path");
const expect = require('chai').expect;
const yaml = require('js-yaml');
const appRoot = require('app-root-path');
const api = require("./handler").internalApi;

describe("Testing Swagger", () => {
  it("Updating Swagger File with API definitions.", (done) => {
    const file = path.join(appRoot.path, "test", `swagger.yml`);
    Promise.resolve(fs.readFileSync(file))
      .then(yaml.safeLoad)
      .then(api.generateSwagger)
      .then(swagger => yaml.dump(swagger))
      .then(swagger => fs.writeFileSync(file, swagger))
      .then(done);
  });

  it("Testing serverless.yml", () => {
    expect(api.generateDifference(
      path.join(appRoot.path, "test", `swagger.yml`),
      path.join(appRoot.path, "test", `serverless.yml`)
    )).to.deep.equal([]);
  });
});
