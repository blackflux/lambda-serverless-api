const assert = require('assert');
const get = require('lodash.get');
const set = require('lodash.set');
const Joi = require('joi-strict');
const pv = require('painless-version');
const moment = require('moment-timezone');
const { Plugin } = require('../plugin');
const { ApiError } = require('../response');

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

const { deprecationHeaderRegexp, sunsetHeaderRegexp } = (() => {
  const dateFormat = [
    '(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\\s+)?',
    '([1-9]?0[1-9]|[1-2]?[0-9]|3[01])\\s+',
    '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+',
    '(19[0-9]{2}|[2-9][0-9]{3})\\s+(2[0-3]|[0-1][0-9]):([0-5][0-9])(?::(60|[0-5][0-9]))?\\s+',
    '([-\\+][0-9]{2}[0-5][0-9]|(?:UT|GMT|(?:E|C|M|P)(?:ST|DT)|[A-IK-Z]))',
    '(\\s+|\\(([^\\(\\)]+|\\\\\\(|\\\\\\))*\\))*'
  ];

  return {
    deprecationHeaderRegexp: new RegExp(['^date="', ...dateFormat, '"$'].join('')),
    sunsetHeaderRegexp: new RegExp(['^', ...dateFormat, '$'].join(''))
  };
})();

const utcDateFormat = 'ddd, DD MMM YYYY HH:mm:ss';

class Versioning extends Plugin {
  constructor(options) {
    super(options);
    const sunsetDurationInDays = get(options, 'sunsetDurationInDays');
    const apiVersionHeader = get(options, 'apiVersionHeader');
    this.versions = (() => {
      const versionsAsList = Object.entries(get(options, 'versions', {}))
        .map(([version, date]) => ({ version, date }))
        .sort((a, b) => {
          assert(a.version !== b.version);
          const asc = pv.test(`${a.version} < ${b.version}`);
          assert(moment.utc(asc ? a.date : b.date) <= moment.utc(asc ? b.date : a.date));
          return asc ? -1 : 1;
        });
      return versionsAsList
        .map(({ version, date }, idx) => {
          if (versionsAsList[idx + 1] === undefined) {
            return {
              version,
              date,
              deprecationDate: null,
              sunsetDate: null,
              isDeprecated: false
            };
          }
          const deprecationDate = moment.utc(versionsAsList[idx + 1].date);
          return {
            version,
            date,
            deprecationDate,
            sunsetDate: deprecationDate.clone().add(sunsetDurationInDays, 'day'),
            isDeprecated: true
          };
        })
        .reduce((p, c) => Object.assign(p, { [c.version]: c }), {});
    })();
    this.parseApiVersion = ({ headers, httpMethod }) => {
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
        throw ApiError(`Invalid format for header "${apiVersionHeader}" provided`, 403);
      }
      if (this.versions[apiVersion] === undefined) {
        throw ApiError(`Unknown version "${apiVersion}" provided`, 403);
      }
      return apiVersion;
    };
  }

  static schema() {
    return {
      versioning: Joi.object().keys({
        sunsetDurationInDays: Joi.number().integer().min(0),
        apiVersionHeader: Joi.string(),
        versions: Joi.object().pattern(
          Joi.string().pattern(VERSION_REGEX),
          Joi.date().iso()
        )
      }).optional()
    };
  }

  static weight() {
    return 10;
  }

  async before({ event, response, router }) {
    this.parseApiVersion(event);
  }

  async after({ event, response, router }) {
    const apiVersion = this.parseApiVersion(event);
    if (apiVersion === null) {
      return;
    }
    assert(response.headers.sunset === undefined || sunsetHeaderRegexp.test(response.headers.sunset));
    assert(response.headers.deprecation === undefined || deprecationHeaderRegexp.test(response.headers.deprecation));
    const { isDeprecated, sunsetDate, deprecationDate } = this.versions[apiVersion];
    if (!isDeprecated) {
      return;
    }
    if (
      response.headers.sunset === undefined
      || sunsetDate.isBefore(moment.utc(response.headers.sunset, utcDateFormat))
    ) {
      set(response.headers, 'sunset', moment.utc(sunsetDate).toDate().toUTCString());
    }
    if (
      response.headers.deprecation === undefined
      || deprecationDate.isBefore(moment.utc(response.headers.deprecation.slice(6, -1), utcDateFormat))
    ) {
      set(response.headers, 'deprecation', `date="${moment.utc(deprecationDate).toDate().toUTCString()}"`);
    }
  }
}
module.exports = Versioning;
