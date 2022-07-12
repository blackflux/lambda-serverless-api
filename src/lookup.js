import get from 'lodash.get';

const positionMap = {
  query: ['queryStringParameters', 'query'],
  json: ['body'],
  path: ['pathParameters', 'path'],
  header: ['headers'],
  identity: ['requestContext.identity', 'identity']
};

const positionKeys = Object.keys(positionMap);

export const hasPosition = (position) => positionKeys.includes(position);
export const getPosition = (event, position, key) => {
  const positions = positionMap[position];
  for (let i = 0; i < positions.length; i += 1) {
    const path = positions[i].split('.');
    path.push(position === 'header' ? key.toLowerCase() : key);
    const result = get(event, path);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
};
