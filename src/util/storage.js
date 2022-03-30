import assert from 'assert';
import LRU from 'lru-cache-ext';
import { logger } from 'lambda-monitor-logger';
import AwsSdkWrap from 'aws-sdk-wrap';
import AWS from './aws.cjs';

const aws = AwsSdkWrap({
  logger,
  services: {
    S3: AWS.S3
  }
});
const { s3 } = aws;

export default (bucket) => {
  assert(bucket === null || typeof bucket === 'string');
  const memoryStorage = new LRU({ maxAge: 60 * 1000 });
  const useMemory = bucket === null;

  return {
    set: async (key, data) => {
      if (useMemory) {
        memoryStorage.set(key, true);
      } else {
        await s3.putGzipObject({
          bucket,
          key,
          data: JSON.stringify(data)
        });
      }
    },
    list: async (prefix) => {
      const result = [];
      if (useMemory) {
        memoryStorage.forEach((value, key) => {
          if (key.startsWith(prefix)) {
            result.push(key);
          }
        });
      } else {
        const keys = await s3.listObjects({ bucket, prefix });
        keys.forEach(({ Key }) => {
          result.push(Key);
        });
      }
      return result;
    }
  };
};
