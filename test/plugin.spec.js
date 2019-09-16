const expect = require('chai').expect;
const { describe } = require('node-tdd');
const { Plugin } = require('../src/plugin');

describe('Testing Plugin', () => {
  let plugin;
  before(() => {
    class PluginInstance extends Plugin {}
    plugin = new PluginInstance({});
  });

  it('Testing Plugin Abstract', () => {
    expect(() => new Plugin()).to.throw('Class "Plugin" is abstract');
  });

  it('Testing schema()', () => {
    expect(() => Plugin.schema()).to.throw('Not Implemented!');
  });

  it('Testing weight()', () => {
    expect(() => Plugin.weight()).to.throw('Not Implemented!');
  });

  it('Testing before()', async ({ capture }) => {
    const e = await capture(() => plugin.before({}));
    expect(e.message).to.equal('Not Implemented!');
  });

  it('Testing after()', async ({ capture }) => {
    const e = await capture(() => plugin.after({}));
    expect(e.message).to.equal('Not Implemented!');
  });
});
