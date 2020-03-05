const get = require('lodash.get');
const set = require('lodash.set');
const cloneDeep = require('lodash.clonedeep');
const Joi = require('joi-strict');
const pv = require('painless-version');
const { logger } = require('lambda-monitor-logger');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');
const Enum = require('../param/enum');

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
    injectVersionHeaderParam: ({ request }) => {
      if (request.method === 'OPTIONS') {
        return;
      }
      if (apiVersionHeader === undefined) {
        return;
      }
      request.params.push(new Enum(apiVersionHeader, 'header', { enums: Object.keys(versions).reverse() }));
    },
    storeApiVersionMeta: ({ request, event, context }) => {
      if (request.routed === false) {
        return;
      }
      if (event.httpMethod === 'OPTIONS') {
        return;
      }
      if (apiVersionHeader === undefined) {
        return;
      }
      const apiVersion = event.headers[apiVersionHeader.toLowerCase()];
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
      if (apiVersionMeta.isDeprecated && apiVersionMeta.sunsetDate < new Date()) {
        logger.warn(`Sunset functionality accessed\n${JSON.stringify(event)}`);
        if (forceSunset === true) {
          throw ApiError(`Version "${apiVersion}" is sunset as of "${apiVersionMeta.sunsetDate.toUTCString()}"`, 403);
        }
      }
      set(context, contextKey, cloneDeep(apiVersionMeta));
    },
    updateDeprecationHeaders: ({ response, context }) => {
      const apiVersionMeta = get(context, contextKey);
      if (apiVersionMeta === undefined) {
        return;
      }
      const { isDeprecated, deprecationDate, sunsetDate } = apiVersionMeta;
      if (!isDeprecated) {
        return;
      }
      pv.updateDeprecationHeaders(response.headers, { deprecationDate, sunsetDate });
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
    return 4;
  }

  beforeRegister(kwargs) {
    this.versionManager.injectVersionHeaderParam(kwargs);
  }

  async before(kwargs) {
    this.versionManager.storeApiVersionMeta(kwargs);
  }

  async after(kwargs) {
    this.versionManager.updateDeprecationHeaders(kwargs);
  }
}

module.exports = Versioning;
