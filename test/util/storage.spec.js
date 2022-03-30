import { expect } from 'chai';
import { describe } from 'node-tdd';
import AWS from 'aws-sdk';
import Storage from '../../src/util/storage.js';

describe('Testing storage.js', {
  useNock: true,
  timestamp: 1598115247,
  cryptoSeed: 'd99efde9-9c6a-4336-bd99-18339fc38a38'
}, () => {
  let prefix;
  let key;
  let data;

  before(() => {
    prefix = 'prefix';
    key = `${prefix}/suffix`;
    data = {};
  });

  it('Testing storage with bucket', async () => {
    const storage = Storage(AWS.S3, 'bucket');
    await storage.set(key, data);
    const result = await storage.list(prefix);
    expect(result).to.deep.equal([key]);
  });

  it('Testing storage with memory', async () => {
    const storage = Storage(AWS.S3, null);
    await storage.set(key, data);
    const result = await storage.list(prefix);
    expect(result).to.deep.equal([key]);
  });

  it('Testing storage with memory different prefix', async () => {
    const storage = Storage(AWS.S3, null);
    await storage.set(key, data);
    const result = await storage.list('test');
    expect(result).to.deep.equal([]);
  });
});
