const assert = require('assert');
const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const pv = require('painless-version');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;
const HEADER_REGEX = (() => {
  const dateFormat = [
    '(Sun|Mon|Tue|Wed|Thu|Fri|Sat), ',
    '([1-9]?0[1-9]|[1-2]?[0-9]|3[01]) ',
    '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ',
    '(19[0-9]{2}|[2-9][0-9]{3}) ',
    '(2[0-3]|[0-1][0-9]):([0-5][0-9])(?::(60|[0-5][0-9])) ',
    '([-\\+][0-9]{2}[0-5][0-9]|(?:UT|GMT|(?:E|C|M|P)(?:ST|DT)|[A-IK-Z]))'
  ];
  return {
    deprecation: new RegExp(['^date="', ...dateFormat, '"$'].join('')),
    sunset: new RegExp(['^', ...dateFormat, '$'].join(''))
  };
})();

const Executor = ({ apiVersionHeader, sunsetDurationInDays, versions: versionsRaw }) => {
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
    return versions[apiVersion];
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

      ['deprecation', 'sunset'].forEach((header) => {
        assert(
          response.headers[header] === undefined || HEADER_REGEX[header].test(response.headers[header]),
          `Bad format "${response.headers[header]}" for response header "${header}" detected`
        );
      });
      if (
        response.headers.deprecation === undefined
        || deprecationDate < Date.parse(response.headers.deprecation.slice(6, -1))
      ) {
        set(response.headers, 'deprecation', `date="${deprecationDate.toUTCString()}"`);
      }
      if (
        response.headers.sunset === undefined
        || sunsetDate < Date.parse(response.headers.sunset)
      ) {
        set(response.headers, 'sunset', sunsetDate.toUTCString());
      }
    }
  };
};

class Versioning extends Plugin {
  constructor(options) {
    super(options);
    this.executor = Executor({
      apiVersionHeader: get(options, 'apiVersionHeader'),
      sunsetDurationInDays: get(options, 'sunsetDurationInDays'),
      versions: get(options, 'versions', {})
    });
  }

  static schema() {
    return {
      versioning: Joi.object().keys({
        apiVersionHeader: Joi.string(),
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
