const path = require("path");
const lambdaTester = require("lambda-tdd")({
  cwd: path.join(__dirname, ".."),
  verbose: process.argv.slice(2).indexOf("--debug") !== -1,
  handlerFile: path.join(__dirname, "handler.js"),
  cassetteFolder: path.join(__dirname, "handler", "__cassettes"),
  envVarYml: path.join(__dirname, "env.yml"),
  testFolder: path.join(__dirname, "handler")
});

lambdaTester.execute();
