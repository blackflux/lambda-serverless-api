const fs = require("fs");
const path = require("path");
const expect = require('chai').expect;
const appRoot = require('app-root-path');
const api = require("./handler").internalApi;

describe("Testing Swagger", () => {
  it("Updating Swagger File with API definitions.", (done) => {
    const file = path.join(appRoot.path, "test", `swagger.json`);
    Promise.resolve(fs.readFileSync(file))
      .then(JSON.parse)
      .then(api.generateSwagger)
      .then(swagger => JSON.stringify(swagger, null, 2))
      .then(swagger => fs.writeFileSync(file, swagger))
      .then(done);
  });

  it("Testing serverless.yml", () => {
    expect(api.generateDifference(
      path.join(appRoot.path, "test", `swagger.json`),
      path.join(appRoot.path, "test", `serverless.yml`)
    )).to.deep.equal([]);
  });
});
