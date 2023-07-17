import assert from 'assert';
import LRU from 'lru-cache-ext';

export default (awsSdkWrap, bucket) => {
  assert(bucket === null || typeof bucket === 'string');
  const memoryStorage = new LRU({
    ttl: 60 * 1000,
    max: 10000
  });
  const useMemory = bucket === null;

  return {
    set: async (key, data) => {
      if (useMemory) {
        memoryStorage.set(key, true);
      } else {
        await awsSdkWrap.s3.putGzipObject({
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
        const keys = await awsSdkWrap.s3.listObjects({ bucket, prefix });
        keys.forEach(({ Key }) => {
          result.push(Key);
        });
      }
      return result;
    }
  };
};
