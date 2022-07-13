import assert from 'assert';
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

  const get = (ident, default_ = undefined) => {
    assert(ident.includes('$'));
    const arr = ident.split('$');
    assert(arr.length === 2);
    const [position, field] = arr;
    const fullpath = position === '' ? [] : lookup[position].split('.');
    if (field !== '') {
      const segments = (position === 'header' ? field.toLowerCase() : field).split('.');
      fullpath.push(...segments);
    }
    return get_(event, fullpath, default_);
  };
  const has = (ident) => get(ident) !== undefined;
  const key = (position) => lookup[position.split('$').shift()];
  return { get, has, key };
};
