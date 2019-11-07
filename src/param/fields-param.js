const assert = require('assert');
const get = require('lodash.get');
const difference = require('lodash.difference');
const objectFields = require('object-fields');
const Str = require('./str');

class FieldsParam extends Str {
  static evaluatePaths(fields) {
    let result = fields;
    if (typeof result === 'function') {
      result = result();
    }
    assert(Array.isArray(result));
    return result;
  }

  constructor(name, position, opts) {
    super(name, position, opts);
    const { fields, autoPrune, enforce } = { autoPrune: null, enforce: [], ...opts };
    assert(typeof autoPrune === 'string' || autoPrune === null);
    assert(Array.isArray(enforce));
    assert(typeof fields === 'function' || Array.isArray(fields));
    this.paramType = 'FieldsParam';
    this.autoPrune = autoPrune;
    this.enforce = enforce;
    this.fields = fields;
  }

  pruneFields(apiResponse, parsedFields) {
    assert(apiResponse.isJsonResponse === true, 'Can only prune JsonResponse');
    assert(typeof this.autoPrune === 'string');
    objectFields.retain(
      this.autoPrune === '' ? apiResponse.payload : get(apiResponse.payload, this.autoPrune),
      parsedFields
    );
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && difference(objectFields.split(value), FieldsParam.evaluatePaths(this.fields)).length !== 0) {
      valid = false;
    }
    return valid;
  }

  get(event) {
    let result = super.get(event);
    if (typeof result === 'string') {
      result = objectFields.split(result);
    }
    this.enforce.forEach((field) => {
      if (!result.includes(field)) {
        result.push(field);
      }
    });
    return result;
  }
}
module.exports = FieldsParam;
