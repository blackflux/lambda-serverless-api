import fs from 'smart-fs';
import path from 'path';
import minimist from 'minimist';
import difference from 'lodash.difference';
import { expect } from 'chai';
import { describe } from 'node-tdd';
import LambdaTdd from 'lambda-tdd';
import * as api from '../src/index.js';
import { stripHeaders, modifiers } from './handler.conf.js';

LambdaTdd({
  cwd: path.join(fs.dirname(import.meta.url), '..'),
  verbose: minimist(process.argv.slice(2)).verbose === true,
  timeout: minimist(process.argv.slice(2)).timeout,
  nockHeal: minimist(process.argv.slice(2))['nock-heal'],
  testHeal: minimist(process.argv.slice(2))['test-heal'],
  enabled: true,
  handlerFile: path.join(fs.dirname(import.meta.url), 'handler.js'),
  cassetteFolder: path.join(fs.dirname(import.meta.url), 'handler', '__cassettes'),
  envVarYml: path.join(fs.dirname(import.meta.url), 'env.yml'),
  envVarYmlRecording: path.join(fs.dirname(import.meta.url), 'env.recording.yml'),
  testFolder: path.join(fs.dirname(import.meta.url), 'handler'),
  stripHeaders,
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
