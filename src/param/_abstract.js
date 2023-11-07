import assert from 'assert';
import get from 'lodash.get';
import { ApiErrorFn } from '../response/api-error.js';
import { VERSION_REGEX } from '../resources/format.js';

const positionMapping = {
  query: 'queryStringParameters',
  json: 'body',
  path: 'pathParameters',
  header: 'headers',
  context: 'requestContext'
};

class Abstract {
  constructor(name, position, {
    required = true,
    nullable = false,
    normalize = true,
    getter = null,
    lowercase = false,
    deprecated = null
  } = {}) {
    assert(Object.keys(positionMapping).includes(position), `Unknown Parameter Position: ${position}`);
    assert(
      nullable === false || ['json', 'context'].includes(position),
      `Parameter Position cannot be nullable: ${position}`
    );
    assert(deprecated === null
        || VERSION_REGEX.test(deprecated), `Incorrect version format for Param "${name}"`);
    this.nameOriginal = name;
    this.name = name.endsWith('+') ? name.slice(0, name.length - 1) : name;
    this.position = position;
    this.stringInput = !['json', 'context'].includes(position);
    this.required = required;
    this.nullable = nullable;
    this.normalize = normalize;
    this.lowercase = lowercase;
    this.deprecated = deprecated;
    this.getter = getter;
    this.type = null;
  }

  validate(value) {
    return !(this.stringInput && typeof value !== 'string');
  }

  get(event) {
    let result = get(event, `${positionMapping[this.position]}.${
      this.position === 'header'
        ? this.name.toLowerCase()
        : this.name
    }`);
    if (result === undefined) {
      if (this.required) {
        throw ApiErrorFn(`Required ${this.position}-Parameter "${this.name}" missing.`, 400, 99002);
      }
    } else if (result === null) {
      if (this.nullable !== true) {
        throw ApiErrorFn(`Non-nullable ${this.position}-Parameter "${this.name}" is null.`, 400, 99006);
      }
    } else if (!this.validate(result)) {
      throw ApiErrorFn(`Invalid Value for ${this.position}-Parameter "${this.name}" provided.`, 400, 99003, {
        value: result
      });
    }
    result = this.getter !== null && ![undefined, null].includes(result)
      ? (params) => this.getter(result, params)
      : result;
    if (typeof result === 'string') {
      if (this.normalize !== false) {
        result = result
          // eslint-disable-next-line no-control-regex
          .replace(/[\x00-\x09\x0B\x1F\x7F-\x9F]/g, ' ')
          .replace(/(?<=\s) /g, '')
          .replace(/ (?=\s)/g, '')
          .replace(/\s+$|^\s+/g, '');
      }
      if (this.lowercase === true) {
        result = result.toLowerCase();
      }
    }
    return result;
  }
}

export default Abstract;
