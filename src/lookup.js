import get_ from 'lodash.get';

export default (event) => {
  const integration = 'method' in event ? 'lambda' : 'proxy';
  const lookup = {
    proxy: {
      query: 'queryStringParameters',
      json: 'body',
      path: 'pathParameters',
      header: 'headers',
      mvheader: 'multiValueHeaders',
      identity: 'requestContext.identity',
      method: 'httpMethod',
      uri: 'path'
    },
    lambda: {
      query: 'query',
      json: 'body',
      path: 'path',
      header: 'headers',
      mvheader: null,
      identity: 'identity',
      method: 'method',
      uri: 'requestPath'
    }
  }[integration];

  const get = (position, field = null) => {
    const fullpath = position === null
      ? []
      : lookup[position].split('.');
    if (field !== null) {
      const segments = (position === 'header' ? field.toLowerCase() : field).split('.')
      fullpath.push(...segments);
    }
    return get_(event, fullpath);
  };
  const has = (position, field = null) => get(position, field) !== undefined;
  const key = (position) => lookup[position];
  return { get, has, key };
};
