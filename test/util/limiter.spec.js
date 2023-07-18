import { expect } from 'chai';
import { describe } from 'node-tdd';
import AwsSdkWrap from 'aws-sdk-wrap';
import { logger } from 'lambda-monitor-logger';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import Limiter from '../../src/util/limiter.js';

describe('Testing limiter.js', {
  timestamp: 1598115247,
  cryptoSeed: 'd99efde9-9c6a-4336-bd99-18339fc38a38'
}, () => {
  let callLimiter;
  let awsSdkWrap;

  before(() => {
    callLimiter = (limiter) => limiter({
      identifier: 'identifier',
      route: 'route',
      data: {}
    });
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

  it('Testing limiter', async () => {
    const limiter = Limiter({
      awsSdkWrap, bucket: null, globalLimit: 2, defaultRouteLimit: 2
    });
    await callLimiter(limiter);
    const result = await callLimiter(limiter);
    expect(result).to.equal(undefined);
  });

  it('Testing "Global limit hit" and sets cache', async ({ capture }) => {
    const limiter = Limiter({
      awsSdkWrap, bucket: null, globalLimit: 0, defaultRouteLimit: 1
    });
    const error = await capture(() => callLimiter(limiter));
    expect(error.message).to.equal('Global limit hit');
  });

  it('Testing "Global limit hit" with cache', async ({ capture }) => {
    const limiter = Limiter({
      awsSdkWrap, bucket: null, globalLimit: 0, defaultRouteLimit: 1
    });
    const error1 = await capture(() => callLimiter(limiter));
    expect(error1.message).to.equal('Global limit hit');
    const error2 = await capture(() => callLimiter(limiter));
    expect(error2.message).to.equal('Global limit hit');
  });

  it('Testing "Endpoint limit hit" and sets cache', async ({ capture }) => {
    const limiter = Limiter({
      awsSdkWrap, bucket: null, globalLimit: 1, defaultRouteLimit: 0
    });
    const error1 = await capture(() => callLimiter(limiter));
    expect(error1.message).to.equal('Endpoint limit hit');
  });

  it('Testing "Endpoint limit hit" with cache', async ({ capture }) => {
    const limiter = Limiter({
      awsSdkWrap, bucket: null, globalLimit: 1, defaultRouteLimit: 0
    });
    const error1 = await capture(() => callLimiter(limiter));
    expect(error1.message).to.equal('Endpoint limit hit');
    const error2 = await capture(() => callLimiter(limiter));
    expect(error2.message).to.equal('Endpoint limit hit');
  });
});
