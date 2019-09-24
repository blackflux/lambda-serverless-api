const expect = require('chai').expect;
const { describe } = require('node-tdd');
const { Plugin } = require('../src/plugin');

describe('Testing Plugin', () => {
  it('Testing Plugin Abstract', () => {
    expect(() => new Plugin()).to.throw('Class "Plugin" is abstract');
  });

  it('Testing schema()', () => {
    expect(() => Plugin.schema()).to.throw('Not Implemented!');
  });

  it('Testing weight()', () => {
    expect(() => Plugin.weight()).to.throw('Not Implemented!');
  });
});
