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
    this.required = required;
    this.type = null;
  }

  // eslint-disable-next-line class-methods-use-this
  validate(value) {
    return true;
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
    if (!(typeof value === 'string' || value instanceof String)) {
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
    if (!String(value).match(this.regex)) {
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

class Bool extends RegEx {
  constructor(name, ...args) {
    super(name, /^(0|1|true|false)$/, ...args);
  }

  get(event) {
    const result = super.get(event);
    return ["1", "true"].indexOf(result) !== -1;
  }
}
module.exports.Bool = (...args) => new Bool(...args);

class Int extends RegEx {
  constructor(name, ...args) {
    super(name, /^(-?[1-9]+\d*)$|^0$/, ...args);
  }

  get(event) {
    const result = super.get(event);
    return Number(result);
  }
}
module.exports.Int = (...args) => new Int(...args);
