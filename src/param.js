const assert = require("assert");
const get = require("lodash.get");
const difference = require("lodash.difference");
const objectPaths = require("obj-paths");
const response = require("./response");

const positionMapping = {
  query: "queryStringParameters",
  json: "body",
  path: "pathParameters",
  header: "headers",
  context: "requestContext"
};

class Param {
  constructor(name, position = 'query', required = true) {
    assert(Object.keys(positionMapping).includes(position), "Invalid Parameter Position");
    this.name = name;
    this.position = position;
    this.stringInput = ["json", "context"].indexOf(position) === -1;
    this.required = required;
    this.type = null;
  }

  // eslint-disable-next-line class-methods-use-this
  validate(value) {
    return !(this.stringInput && typeof value !== 'string');
  }

  get(event) {
    const result = get(event, `${positionMapping[this.position]}.${
      this.position === "header"
        ? Object
          .keys(get(event, positionMapping[this.position], {}))
          .reduce((prev, cur) => Object.assign(prev, { [cur.toLowerCase()]: cur }), {})[this.name.toLowerCase()]
        : this.name
    }`);
    if (result === undefined) {
      if (this.required) {
        throw response.ApiError(`Required ${this.position}-Parameter "${this.name}" missing.`, 400, 99002);
      }
    } else if (!this.validate(result)) {
      throw response.ApiError(`Invalid Value for ${this.position}-Parameter "${this.name}" provided.`, 400, 99003, {
        value: result
      });
    }
    return result;
  }
}

class Str extends Param {
  constructor(...args) {
    super(...args);
    this.type = "string";
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

class Bool extends Param {
  constructor(...args) {
    super(...args);
    this.type = "boolean";
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
    if (result === undefined) {
      return result;
    }
    return this.stringInput ? ["1", "true"].indexOf(result) !== -1 : result === true;
  }
}
module.exports.Bool = (...args) => new Bool(...args);

class Int extends Param {
  constructor(...args) {
    super(...args);
    this.type = "integer";
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
    if (result === undefined) {
      return result;
    }
    return this.stringInput ? Number(result) : result;
  }
}
module.exports.Int = (...args) => new Int(...args);

class List extends Param {
  constructor(...args) {
    super(...args);
    this.type = "array";
    this.items = [
      { type: "string" },
      { type: "number" },
      { type: "integer" },
      { type: "boolean" }
    ];
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
    if (result === undefined) {
      return result;
    }
    return this.stringInput ? JSON.parse(result) : result;
  }
}
module.exports.List = (...args) => new List(...args);

class FieldsParam extends Str {
  constructor(name, paths, ...args) {
    super(name, ...args);
    this.paths = Array.isArray(paths) ? paths : objectPaths.split(paths);
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && difference(objectPaths.split(value), this.paths).length !== 0) {
      valid = false;
    }
    return valid;
  }
}
module.exports.FieldsParam = (...args) => new FieldsParam(...args);

class StrList extends List {
  constructor(...args) {
    super(...args);
    this.items = [{ type: "string" }];
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
    this.items = [{ type: "number" }];
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


class GeoPoint extends NumberList {
  validate(value) {
    let valid = super.validate(value);
    const valueParsed = (this.stringInput ? JSON.parse(value) : value);
    if (valid && (this.stringInput ? JSON.parse(value) : value).length !== 2) {
      valid = false;
    } else if (valueParsed[0] < -180 || valueParsed[0] > 180) {
      valid = false;
    } else if (valueParsed[1] < -90 || valueParsed[1] > 90) {
      valid = false;
    }
    return valid;
  }
}
module.exports.GeoPoint = (...args) => new GeoPoint(...args);


class Json extends Param {
  constructor(...args) {
    super(...args);
    this.type = this.stringInput ? "string" : "object";
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
    if (valid && typeof valueParsed !== 'object') {
      valid = false;
    }
    return valid;
  }

  get(event) {
    const result = super.get(event);
    if (result === undefined) {
      return result;
    }
    return this.stringInput ? JSON.parse(result) : result;
  }
}
module.exports.Json = (...args) => new Json(...args);
