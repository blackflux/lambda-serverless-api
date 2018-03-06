const fs = require("fs");
const path = require("path");
const appRoot = require('app-root-path');
const SwaggerParser = require('swagger-parser');
const generateSwagger = require("./handler").generateSwagger;

describe("Testing Swagger", () => {
  it("Testing Generation", (done) => {
    const file = path.join(appRoot.path, `swagger.json`);
    fs.writeFileSync(file, JSON.stringify(generateSwagger(), null, 2));
    SwaggerParser.validate(file, err => done(err));
  });
});
