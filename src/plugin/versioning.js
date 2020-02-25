const get = require('lodash.get');
const Joi = require('joi-strict');
const pv = require('painless-version');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

const Executor = ({
  apiVersionHeader,
  forceSunset,
  sunsetDurationInDays,
  versions: versionsRaw
}) => {
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

  const getApiVersionMeta = ({ headers, httpMethod }) => {
    if (httpMethod === 'OPTIONS') {
      return null;
    }
    if (apiVersionHeader === undefined) {
      return null;
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
    return apiVersionMeta;
  };

  return {
    getApiVersionMeta,
    updateDeprecationHeader: (event, response) => {
      const versionMeta = getApiVersionMeta(event);
      if (versionMeta === null) {
        return;
      }
      const { isDeprecated, deprecationDate, sunsetDate } = versionMeta;
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
    this.executor = Executor({
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
    return 2;
  }

  async before({ event, response, router }) {
    this.executor.getApiVersionMeta(event);
  }

  async after({ event, response, router }) {
    this.executor.updateDeprecationHeader(event, response);
  }
}

module.exports = Versioning;
