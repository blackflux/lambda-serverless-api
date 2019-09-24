const path = require('path');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const { Plugin } = require('../src/plugin');
const { Module } = require('../src/logic/module');

describe('Testing Plugin', () => {
  let module;
  before(() => {
    module = new Module(path.join(__dirname, '..', 'src', 'plugin'), {});
  });

  it('Test Abstract Plugin Definition', async ({ fixture }) => {
    const expected = fixture('expected-order');
    expect(Object.getOwnPropertyNames(Plugin.prototype))
      .to.deep.equal(Object.keys(expected));
  });

  it('Test Plugin Instances Definition', async ({ fixture }) => {
    const expected = fixture('expected-order');
    const plugins = module.getPlugins();
    plugins.forEach((p) => {
      expect(Object.keys(expected), `Badly defined Plugin: ${p.constructor.name}`)
        .to.include.members(Object.getOwnPropertyNames(Object.getPrototypeOf(p)));
    });
  });

  it('Test Execution Order', async ({ fixture }) => {
    const expected = fixture('expected-order');
    const plugins = module.getPlugins();
    Object.entries(expected).forEach(([fn, expectedPlugins]) => {
      const filteredPlugins = plugins
        .filter((p) => Object.getOwnPropertyNames(Object.getPrototypeOf(p)).includes(fn))
        .map((p) => p.constructor.name);
      expect(filteredPlugins, `Unexpected Order / Plugins: ${fn}`).to.deep.equal(expectedPlugins);
    });
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
});
