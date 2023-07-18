import { expect } from 'chai';
import { describe } from 'node-tdd';
import AwsSdkWrap from 'aws-sdk-wrap';
import { logger } from 'lambda-monitor-logger';
import {
  PutObjectCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3';
import Storage from '../../src/util/storage.js';

describe('Testing storage.js', {
  useNock: true,
  timestamp: 1598115247,
  cryptoSeed: 'd99efde9-9c6a-4336-bd99-18339fc38a38',
  envVars: {
    AWS_REGION: 'us-east-1'
  }
}, () => {
  let prefix;
  let key;
  let data;
  let awsSdkWrap;

  before(() => {
    prefix = 'prefix';
    key = `${prefix}/suffix`;
    data = {};
    awsSdkWrap = AwsSdkWrap({
      logger,
      services: {
        S3: S3Client,
        'S3:CMD': {
          PutObjectCommand,
          ListObjectsV2Command
        }
      }
    });
  });

  it('Testing storage with bucket', async () => {
    const storage = Storage(awsSdkWrap, 'bucket');
    await storage.set(key, data);
    const result = await storage.list(prefix);
    expect(result).to.deep.equal([key]);
  });

  it('Testing storage with memory', async () => {
    const storage = Storage(awsSdkWrap, null);
    await storage.set(key, data);
    const result = await storage.list(prefix);
    expect(result).to.deep.equal([key]);
  });

  it('Testing storage with memory different prefix', async () => {
    const storage = Storage(awsSdkWrap, null);
    await storage.set(key, data);
    const result = await storage.list('test');
    expect(result).to.deep.equal([]);
  });
});
