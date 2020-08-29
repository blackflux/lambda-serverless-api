const assert = require('assert');
const LRU = require('lru-cache-ext');
const { logger } = require('lambda-monitor-logger');
const { s3 } = require('aws-sdk-wrap')({ logger });

module.exports = (bucket) => {
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
