const assert = require('assert');
const get = require('lodash.get');
const difference = require('lodash.difference');
const moment = require('moment');
const Joi = require('joi');
const objectPaths = require('obj-paths');
const response = require('./response');

const positionMapping = {
  query: 'queryStringParameters',
  json: 'body',
  path: 'pathParameters',
  header: 'headers',
  context: 'requestContext'
};

class Param {
  constructor(name, position = 'query', required = true, { nullable = false, getter = null } = {}) {
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
    return this.getter !== null && ![undefined, null].includes(result) ? this.getter(result) : result;
  }
}

class Str extends Param {
  constructor(...args) {
    super(...args);
    this.type = 'string';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !(typeof value === 'string' || value instanceof String)) {
      valid = false;
    }
    return valid;
  }
}
module.exports.Str = (...args) => new Str(...args);

class RegEx extends Str {
  constructor(name, regex, ...args) {
    super(name, ...args);
    this.regex = regex;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !value.match(this.regex)) {
      valid = false;
    }
    return valid;
  }
}
module.exports.RegEx = (...args) => new RegEx(...args);

class Email extends RegEx {
  constructor(name, ...args) {
    super(name, /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, ...args);
  }
}
module.exports.Email = (...args) => new Email(...args);

class UUID extends RegEx {
  constructor(name, ...args) {
    super(name, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, ...args);
  }
}
module.exports.UUID = (...args) => new UUID(...args);

class IsoDate extends RegEx {
  constructor(name, ...args) {
    super(name, new RegExp(
      /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|/.source
      + /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|/.source
      + /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/.source
    ), ...args);
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !moment(value).isValid()) {
      valid = false;
    }
    return valid;
  }
}
module.exports.IsoDate = (...args) => new IsoDate(...args);

class Bool extends Param {
  constructor(...args) {
    super(...args);
    this.type = 'boolean';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && this.stringInput ? !value.match(/^(0|1|true|false)$/) : typeof value !== 'boolean') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? ['1', 'true'].indexOf(result) !== -1 : result === true;
  }
}
module.exports.Bool = (...args) => new Bool(...args);

class Int extends Param {
  constructor(...args) {
    super(...args);
    this.type = 'integer';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && this.stringInput ? !value.match(/^(-?[1-9]+\d*)$|^0$/) : typeof value !== 'number') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? Number(result) : result;
  }
}
module.exports.Int = (...args) => new Int(...args);

class List extends Param {
  constructor(...args) {
    super(...args);
    this.type = 'array';
    this.items = {
      allOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'integer' },
        { type: 'boolean' }
      ]
    };
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      try {
        valueParsed = JSON.parse(value);
      } catch (e) {
        valid = false;
      }
    }
    if (valid && !Array.isArray(valueParsed)) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? JSON.parse(result) : result;
  }
}
module.exports.List = (...args) => new List(...args);

class FieldsParam extends Str {
  static evaluatePaths(paths) {
    let result = paths;
    if (typeof result === 'function') {
      result = result();
    }
    return typeof result === 'string' ? objectPaths.split(result) : result;
  }

  constructor(name, paths, ...args) {
    super(name, ...args);
    this.paths = paths;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && difference(objectPaths.split(value), FieldsParam.evaluatePaths(this.paths)).length !== 0) {
      valid = false;
    }
    return valid;
  }
}
module.exports.FieldsParam = (...args) => new FieldsParam(...args);

class StrList extends List {
  constructor(...args) {
    super(...args);
    this.items = { type: 'string' };
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && (this.stringInput ? JSON.parse(value) : value).some(e => typeof e !== 'string')) {
      valid = false;
    }
    return valid;
  }
}
module.exports.StrList = (...args) => new StrList(...args);

class NumberList extends List {
  constructor(...args) {
    super(...args);
    this.items = { type: 'number' };
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && (this.stringInput ? JSON.parse(value) : value).some(e => typeof e !== 'number')) {
      valid = false;
    }
    return valid;
  }
}
module.exports.NumberList = (...args) => new NumberList(...args);


class Json extends Param {
  constructor(name, schema, ...args) {
    super(name, ...args);
    assert(get(schema, 'isJoi') === true, 'Joi Schema required');
    this.type = this.stringInput ? 'string' : 'object';
    this.schema = schema;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      try {
        valueParsed = JSON.parse(value);
      } catch (e) {
        valid = false;
      }
    }
    if (valid && Joi.validate(valueParsed, this.schema).error !== null) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if ([undefined, null].includes(result)) {
      return result;
    }
    return this.stringInput ? JSON.parse(result) : result;
  }
}
module.exports.Json = (...args) => new Json(...args);


class GeoPoint extends NumberList {
  constructor(...args) {
    super(...args);
    this.minItems = 2;
    this.maxItems = 2;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid) {
      const valueParsed = (this.stringInput ? JSON.parse(value) : value);
      if (
        valueParsed.length !== 2
        || valueParsed[0] < -180
        || valueParsed[0] > 180
        || valueParsed[1] < -90
        || valueParsed[1] > 90
      ) {
        valid = false;
      }
    }
    return valid;
  }
}
module.exports.GeoPoint = (...args) => new GeoPoint(...args);


class GeoRect extends NumberList {
  constructor(...args) {
    super(...args);
    this.minItems = 4;
    this.maxItems = 4;
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid) {
      const valueParsed = (this.stringInput ? JSON.parse(value) : value);
      if (
        valueParsed.length !== 4
        // check bounds
        || valueParsed[0] < -180
        || valueParsed[0] > 180
        || valueParsed[1] < -90
        || valueParsed[1] > 90
        || valueParsed[2] < -180
        || valueParsed[2] > 180
        || valueParsed[3] < -90
        || valueParsed[3] > 90
        // check latitude (longitude always valid because rect covering anti-meridian valid in es)
        || valueParsed[1] < valueParsed[3]
      ) {
        valid = false;
      }
    }
    return valid;
  }
}
module.exports.GeoRect = (...args) => new GeoRect(...args);


class GeoShape extends Json {
  constructor(name, { maxPoints, clockwise } = {}, ...args) {
    let schema = Joi.array().items(Joi.array().ordered([
      Joi.number().min(-180).max(180).required(),
      Joi.number().min(-90).max(90).required()
    ]));
    if (maxPoints !== undefined) {
      schema = schema.max(maxPoints);
    }
    super(name, schema, ...args);
    this.clockwise = clockwise;
    this.type = 'array';
    this.items = { type: 'array', items: { type: 'number' } };
  }

  static isDirectional(arr, clockwise) {
    let result = (arr[arr.length - 1][1] * arr[0][0]) - (arr[0][1] * arr[arr.length - 1][0]);
    for (let i = 0; i < arr.length - 1; i += 1) {
      result += (arr[i][1] * arr[i + 1][0]) - (arr[i + 1][1] * arr[i][0]);
    }
    return clockwise ? result > 0 : result < 0;
  }

  validate(value) {
    let valid = super.validate(value);
    let valueParsed = value;
    if (valid && this.stringInput) {
      // already validated by super
      valueParsed = JSON.parse(value);
    }
    // check direction
    if (valid && this.clockwise !== undefined && !GeoShape.isDirectional(valueParsed, this.clockwise)) {
      valid = false;
    }
    // ensure closed polygon
    if (valid && (
      valueParsed[0][0] !== valueParsed[valueParsed.length - 1][0]
      || valueParsed[0][1] !== valueParsed[valueParsed.length - 1][1])) {
      valid = false;
    }
    // ensure non-degenerate polygon
    if (valid && new Set(valueParsed.map(p => `${p[0]}${p[1]}`)).size !== valueParsed.length - 1) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    return super.get(event);
  }
}
module.exports.GeoShape = (...args) => new GeoShape(...args);


class NumberParam extends Json {
  constructor(name, { min, max } = {}, ...args) {
    let schema = Joi.number();
    if (min !== undefined) {
      schema = schema.min(min);
    }
    if (max !== undefined) {
      schema = schema.max(max);
    }
    super(name, schema, ...args);
    this.type = 'number';
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && !this.stringInput && typeof value !== 'number') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    return super.get(event);
  }
}
module.exports.Number = (...args) => new NumberParam(...args);
