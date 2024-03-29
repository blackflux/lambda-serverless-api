import crypto from 'crypto';
import objectHash from 'object-hash-strict';
import LRU from 'lru-cache-ext';

import Storage from './storage.js';

const generateInterval = (identifier) => `${identifier}/${
  new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '/')
}`;

export default ({
  awsSdkWrap, bucket, globalLimit, defaultRouteLimit
}) => {
  const memoryCache = new LRU({
    ttl: 60 * 1000,
    max: 10000
  });
  const storage = Storage(awsSdkWrap, bucket);

  return async ({
    identifier,
    route,
    data,
    routeLimit = defaultRouteLimit
  }) => {
    const interval = `${generateInterval(identifier)}/`;
    const routeHash = objectHash(route);
    const prefix = `${interval}${routeHash}/`;
    if (memoryCache.has(interval)) {
      throw new Error('Global limit hit');
    }
    if (memoryCache.has(prefix)) {
      throw new Error('Endpoint limit hit');
    }
    const [keys] = await Promise.all([
      storage.list(interval),
      storage.set(`${prefix}${
        data?.event?.requestContext?.requestId === undefined
          ? crypto.randomBytes(16)
          : crypto.createHash('md5').update(
            data?.event?.requestContext?.requestId
          ).digest('hex')
      }.json.gz`, data)
    ]);
    if (keys.length >= globalLimit) {
      memoryCache.set(interval, true);
      throw new Error('Global limit hit');
    }
    if (keys.filter((key) => key.startsWith(prefix)).length >= routeLimit) {
      memoryCache.set(prefix, true);
      throw new Error('Endpoint limit hit');
    }
  };
};
