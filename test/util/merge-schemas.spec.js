const expect = require('chai').expect;
const { describe } = require('node-tdd');
const mergeSchemas = require('../../src/util/merge-schemas');

describe('Testing merge-schemas.js', () => {
  it('Testing multi-option-path target throws error', () => {
    expect(() => mergeSchemas([{ k: null }, { k: null }])).to.throw('Option path(s) must be unique: k');
  });
});
