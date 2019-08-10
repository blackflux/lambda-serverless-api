const assert = require('assert');
const get = require('lodash.get');
const response = require('../response');

const positionMapping = {
  query: 'queryStringParameters',
  json: 'body',
  path: 'pathParameters',
  header: 'headers',
  context: 'requestContext'
};

class Abstract {
  constructor(name, position, { required = true, nullable = false, getter = null } = {}) {
    assert(Object.keys(positionMapping).includes(position), `Unknown Parameter Position: ${position}`);
    assert(
      nullable === false || ['json', 'context'].includes(position),
      `Parameter Position cannot be nullable: ${position}`
    );
    this.nameOriginal = name;
    this.name = name.endsWith('+') ? name.slice(0, name.length - 1) : name;
    this.position = position;
    this.stringInput = !['json', 'context'].includes(position);
    this.required = required;
    this.nullable = nullable;
    this.getter = getter;
    this.type = null;
  }

  // eslint-disable-next-line class-methods-use-this
  validate(value) {
    return !(this.stringInput && typeof value !== 'string');
  }

  get(event) {
    const result = get(event, `${positionMapping[this.position]}.${
      this.position === 'header'
        ? Object
          .keys(get(event, positionMapping[this.position]) || {})
          .reduce((prev, cur) => Object.assign(prev, { [cur.toLowerCase()]: cur }), {})[this.name.toLowerCase()]
        : this.name
    }`);
    if (result === undefined) {
      if (this.required) {
        throw response.ApiError(`Required ${this.position}-Parameter "${this.name}" missing.`, 400, 99002);
      }
    } else if (result === null) {
      if (this.nullable !== true) {
        throw response.ApiError(`Non-nullable ${this.position}-Parameter "${this.name}" is null.`, 400, 99006);
      }
    } else if (!this.validate(result)) {
      throw response.ApiError(`Invalid Value for ${this.position}-Parameter "${this.name}" provided.`, 400, 99003, {
        value: result
      });
    }
    return this.getter !== null && ![undefined, null].includes(result)
      ? (params) => this.getter(result, params)
      : result;
  }
}

module.exports = Abstract;
