import { expect } from 'chai';
import { describe } from 'node-tdd';
import mergeSchemas from '../../src/util/merge-schemas.js';

describe('Testing merge-schemas.js', () => {
  it('Testing multi-option-path target throws error', () => {
    expect(() => mergeSchemas([{ k: null }, { k: null }])).to.throw('Option path(s) must be unique: k');
  });
});
