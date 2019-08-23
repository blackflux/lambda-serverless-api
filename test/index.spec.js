const path = require('path');
const difference = require('lodash.difference');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const lambdaTester = require('lambda-tdd')({
  cwd: path.join(__dirname, '..'),
  verbose: process.argv.slice(2).indexOf('--verbose') !== -1,
  handlerFile: path.join(__dirname, 'handler.js'),
  cassetteFolder: path.join(__dirname, 'handler', '__cassettes'),
  envVarYml: path.join(__dirname, 'env.yml'),
  testFolder: path.join(__dirname, 'handler')
});
const api = require('../src/index');

lambdaTester.execute((process.argv.slice(2).find((e) => e.startsWith('--filter=')) || '').substring(9));

describe('Testing index.js', () => {
  it('Testing Exports Synchronized.', () => {
    expect(difference(Object.keys(api), Object.keys(api.Api()))).to.deep.equal(['Api']);
    expect(difference(Object.keys(api.Api()), Object.keys(api)).sort()).to.deep.equal([
      'generateSwagger',
      'rollbar',
      'router',
      'wrap'
    ]);
  });
});
