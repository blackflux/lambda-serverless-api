const get = require("lodash.get");
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
    if (Object.keys(positionMapping).indexOf(position) === -1) {
      throw new Error(`Parameter Position needs to be one of: ${Object.keys(positionMapping).join(", ")}`);
    }
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
    const result = get(event, `${positionMapping[this.position]}.${this.name}`);
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
