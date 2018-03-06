const get = require("lodash.get");
const response = require("./response");

const types = {
  query: "queryStringParameters",
  json: "body",
  path: "pathParameters",
  header: "headers",
  context: "requestContext"
};

class Param {
  constructor(name, type = 'query', required = true) {
    this.name = name;
    this.type = type;
    this.required = required;
  }

  feed(event) {
    this.event = event;
  }

  // eslint-disable-next-line class-methods-use-this
  validate(value) {
    return true;
  }

  get() {
    const result = get(this.event, `${types[this.type]}.${this.name}`);
    if (result === undefined) {
      if (this.required) {
        throw response.ApiError(`Required ${this.type}-Parameter "${this.name}" missing.`);
      }
    } else if (!this.validate(result)) {
      // todo: add context
      throw response.ApiError(`Invalid Value for ${this.type}-Parameter "${this.name}" provided.`);
    }
    return result;
  }
}

class Str extends Param {
  validate(value) {
    let valid = super.validate(value);
    if (!(typeof value === 'string' || value instanceof String)) {
      valid = false;
    }
    return valid;
  }
}
module.exports.Str = (...args) => new Str(...args);

class Email extends Str {
  validate(value) {
    let valid = super.validate(value);
    if (!value.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      valid = false;
    }
    return valid;
  }
}
module.exports.Email = (...args) => new Email(...args);
