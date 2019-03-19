const assert = require('assert');
const get = require('lodash.get');
const Joi = require('joi');
const Param = require('./params/param');
const Str = require('./params/str');
const RegEx = require('./params/regex');
const Email = require('./params/email');
const UUID = require('./params/uuid');
const IsoDate = require('./params/isodate');
const Bool = require('./params/bool');
const Int = require('./params/int');
const List = require('./params/list');
const FieldsParam = require('./params/fields-param');

module.exports.Str = (...args) => new Str(...args);
module.exports.RegEx = (...args) => new RegEx(...args);
module.exports.Email = (...args) => new Email(...args);
module.exports.UUID = (...args) => new UUID(...args);
module.exports.IsoDate = (...args) => new IsoDate(...args);
module.exports.Bool = (...args) => new Bool(...args);
module.exports.Int = (...args) => new Int(...args);
module.exports.List = (...args) => new List(...args);
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
