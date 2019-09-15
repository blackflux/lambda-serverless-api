const Joi = require('joi-strict');

module.exports = (schemas) => {
  const collisions = Object
    .entries(schemas
      .reduce((p, c) => {
        const [key] = Object.keys(c);
        // eslint-disable-next-line no-param-reassign
        p[key] = (p[key] || 0) + 1;
        return p;
      }, {}))
    .filter(([key, count]) => count !== 1)
    .map(([key]) => key);
  if (collisions.length !== 0) {
    throw new Error(`Option path(s) must be unique: ${collisions.join(', ')}`);
  }
  return Joi.object().keys(Object.assign({}, ...schemas));
};
