const expect = require('chai').expect;
const { describe } = require('node-tdd');
const { Plugin } = require('../src/plugin');

describe('Testing Plugin', () => {
  let plugin;
  before(() => {
    plugin = new Plugin({});
  });

  it('Testing schema()', () => {
    expect(() => Plugin.schema()).to.throw('Not Implemented!');
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
