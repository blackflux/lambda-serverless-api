const path = require('path');
const minimist = require('minimist');
const difference = require('lodash.difference');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const LambdaTdd = require('lambda-tdd');
const api = require('../src/index');
const { stripHeaders, flush, modifiers } = require('./handler.conf');

LambdaTdd({
  cwd: path.join(__dirname, '..'),
  verbose: minimist(process.argv.slice(2)).verbose === true,
  timeout: minimist(process.argv.slice(2)).timeout,
  nockHeal: minimist(process.argv.slice(2))['nock-heal'],
  testHeal: minimist(process.argv.slice(2))['test-heal'],
  enabled: true,
  handlerFile: path.join(__dirname, 'handler.js'),
  cassetteFolder: path.join(__dirname, 'handler', '__cassettes'),
  envVarYml: path.join(__dirname, 'env.yml'),
  envVarYmlRecording: path.join(__dirname, 'env.recording.yml'),
  testFolder: path.join(__dirname, 'handler'),
  stripHeaders,
  flush,
  modifiers
}).execute();

describe('Testing index.js', () => {
  it('Testing Exports Synchronized.', () => {
    expect(difference(Object.keys(api), Object.keys(api.Api()))).to.deep.equal(['Api']);
    expect(difference(Object.keys(api.Api()), Object.keys(api)).sort()).to.deep.equal([
      'generateSwagger',
      'router',
      'wrap'
    ]);
  });
});
