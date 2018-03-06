const fs = require("fs");
const path = require("path");
const appRoot = require('app-root-path');
const SwaggerParser = require('swagger-parser');
const generateSwagger = require("./handler").generateSwagger;
const lambdaTester = require("lambda-tdd")({
  cwd: path.join(__dirname, ".."),
  verbose: process.argv.slice(2).indexOf("--debug") !== -1,
  handlerFile: path.join(__dirname, "handler.js"),
  cassetteFolder: path.join(__dirname, "handler", "__cassettes"),
  envVarYml: path.join(__dirname, "env.yml"),
  testFolder: path.join(__dirname, "handler")
});

lambdaTester.execute((process.argv.slice(2).find(e => e.startsWith("--filter=")) || "").substring(9));


describe("Testing Swagger", () => {
  it("Testing Generation", (done) => {
    const file = path.join(appRoot.path, `swagger.json`);
    fs.writeFileSync(file, JSON.stringify(generateSwagger(), null, 2));
    SwaggerParser.validate(file, err => done(err));
  });
});
