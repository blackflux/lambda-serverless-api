const expect = require('chai').expect;
const Merge = require('./../../src/util/merge');

const target = {};
const data = {};

describe('Testing Marge', () => {
  beforeEach(() => {
    Object.assign(target, { some: { path: 'a' }, other: { path: 'a' } });
    Object.assign(data, { some: { path: 'b' }, other: { path: 'b' } });
  });

  it('Testing Overwrite', () => {
    const merge = Merge(['some.path'], []);
    merge(target, data);
    expect(target).to.deep.equal({ some: { path: 'b' }, other: { path: 'a' } });
  });

  it('Testing Append Twice', () => {
    const merge = Merge([], ['some.path']);
    merge(target, data);
    merge(target, data);
    expect(target).to.deep.equal({ some: { path: 'a\nb' }, other: { path: 'a' } });
  });
});
