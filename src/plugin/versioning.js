const get = require('lodash.get');
const set = require('lodash.set');
const cloneDeep = require('lodash.clonedeep');
const Joi = require('joi-strict');
const pv = require('painless-version');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

const VersionManager = ({
  apiVersionHeader,
  forceSunset,
  sunsetDurationInDays,
  versions: versionsRaw
}) => {
  const contextKey = 'custom.versioning.meta';
  const versions = Object.entries(versionsRaw)
    .map(([version, date]) => ({ version, date, unix: Date.parse(date) }))
    .sort((a, b) => (pv.test(`${a.version} < ${b.version}`) ? -1 : 1))
    .map((e, idx, arr) => Object.assign(e, {
      isDeprecated: arr[idx + 1] !== undefined,
      deprecationDate: arr[idx + 1] !== undefined ? new Date(arr[idx + 1].unix) : null,
      sunsetDate: arr[idx + 1] !== undefined
        ? new Date(arr[idx + 1].unix + sunsetDurationInDays * 1000 * 60 * 60 * 24)
        : null
    }))
    .reduce((p, c) => Object.assign(p, { [c.version]: c }), {});

  return {
    storeApiVersionMeta: ({ headers, httpMethod }, context) => {
      if (httpMethod === 'OPTIONS') {
        return;
      }
      if (apiVersionHeader === undefined) {
        return;
      }
      const apiVersion = headers[apiVersionHeader.toLowerCase()];
      if (apiVersion === undefined) {
        throw ApiError(`Required header "${apiVersionHeader}" missing`, 403);
      }
      if (!VERSION_REGEX.test(apiVersion)) {
        throw ApiError(`Invalid value "${apiVersion}" for header "${apiVersionHeader}" provided`, 403);
      }
      if (versions[apiVersion] === undefined) {
        throw ApiError(`Unknown version "${apiVersion}" for header "${apiVersionHeader}" provided`, 403);
      }
      const apiVersionMeta = versions[apiVersion];
      if (forceSunset === true && apiVersionMeta.isDeprecated && apiVersionMeta.sunsetDate < new Date()) {
        throw ApiError(`Version "${apiVersion}" is sunset as of "${apiVersionMeta.sunsetDate.toUTCString()}"`, 403);
      }
      set(context, contextKey, cloneDeep(apiVersionMeta));
    },
    updateDeprecationHeaders: ({ headers }, context) => {
      const apiVersionMeta = get(context, contextKey);
      if (apiVersionMeta === undefined) {
        return;
      }
      const { isDeprecated, deprecationDate, sunsetDate } = apiVersionMeta;
      if (!isDeprecated) {
        return;
      }
      pv.updateDeprecationHeaders(headers, { deprecationDate, sunsetDate });
    }
  };
};

class Versioning extends Plugin {
  constructor(options) {
    super(options);
    this.versionManager = VersionManager({
      apiVersionHeader: get(options, 'apiVersionHeader'),
      forceSunset: get(options, 'forceSunset'),
      sunsetDurationInDays: get(options, 'sunsetDurationInDays'),
      versions: get(options, 'versions', {})
    });
  }

  static schema() {
    return {
      versioning: Joi.object().keys({
        apiVersionHeader: Joi.string(),
        forceSunset: Joi.boolean(),
        sunsetDurationInDays: Joi.number().integer().min(0),
        versions: Joi.object().pattern(
          Joi.string().pattern(VERSION_REGEX),
          Joi.date().iso()
        )
      }).optional()
    };
  }

  static weight() {
    return 3;
  }

  async before({ event, context }) {
    this.versionManager.storeApiVersionMeta(event, context);
  }

  async after({ response, context }) {
    this.versionManager.updateDeprecationHeaders(response, context);
  }
}

module.exports = Versioning;
