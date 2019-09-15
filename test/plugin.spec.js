const expect = require('chai').expect;
const { describe } = require('node-tdd');
const { Plugin } = require('../src/plugin');

describe('Testing Plugin', () => {
  let plugin;
  before(() => {
    plugin = new Plugin({});
  });

  it('Testing getOptionPath()', () => {
    expect(() => Plugin.getOptionPath()).to.throw('Not Implemented!');
  });

  it('Testing before', () => {
    expect(plugin.before({})).to.equal(undefined);
  });

  it('Testing after', () => {
    expect(plugin.after({})).to.equal(undefined);
  });
});
