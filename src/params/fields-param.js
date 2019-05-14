const assert = require('assert');
const get = require('lodash.get');
const difference = require('lodash.difference');
const objectPaths = require('obj-paths');
const objectRewrite = require('object-rewrite');
const Str = require('./str');

class FieldsParam extends Str {
  static evaluatePaths(allowedFields) {
    let result = allowedFields;
    if (typeof result === 'function') {
      result = result();
    }
    return typeof result === 'string' ? objectPaths.split(result) : result;
  }

  constructor(name, position, opts) {
    super(name, position, opts);
    const { allowedFields, autoPrune, autoPrunePath } = Object.assign({ autoPrune: false, autoPrunePath: null }, opts);
    assert(typeof autoPrune === 'boolean');
    assert(typeof autoPrunePath === 'string' || autoPrunePath === null);
    this.paramType = 'FieldsParam';
    this.allowedFields = allowedFields;
    this.autoPrune = autoPrune;
    this.autoPrunePath = autoPrunePath;
  }

  pruneFields(apiResponse, parsedFields) {
    assert(apiResponse.isJsonResponse === true, 'Can only prune JsonResponse');
    objectRewrite({
      retain: parsedFields
    })(this.autoPrunePath !== null ? get(apiResponse.payload, this.autoPrunePath) : apiResponse.payload);
  }

  validate(value) {
    let valid = super.validate(value);
    if (valid && difference(objectPaths.split(value), FieldsParam.evaluatePaths(this.allowedFields)).length !== 0) {
      valid = false;
    }
    return valid;
  }
}
module.exports = FieldsParam;
