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
    const { fields, autoPrune } = { autoPrune: null, ...opts };
    assert(typeof autoPrune === 'string' || autoPrune === null);
    assert(typeof fields === 'function' || Array.isArray(fields));
    this.paramType = 'FieldsParam';
    this.fields = fields;
    this.autoPrune = autoPrune;
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
    const result = super.get(event);
    return typeof result === 'string' ? objectFields.split(result) : result;
  }
}
module.exports = FieldsParam;
