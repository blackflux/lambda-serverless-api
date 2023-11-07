import get from 'lodash.get';
import set from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';
import Joi from 'joi-strict';
import { test, updateDeprecationHeaders } from 'painless-version';
import { logger } from 'lambda-monitor-logger';
import { Plugin } from '../plugin.js';
import { ApiErrorFn } from '../response/api-error.js';
import { VERSION_REGEX } from '../resources/format.js';
import Enum from '../param/enum.js';

const VersionManager = ({
  apiVersionHeader,
  forceSunset,
  sunsetDurationInDays,
  versions: versionsRaw,
  onDeprecated
}) => {
  const contextKey = 'custom.versioning.meta';
  const versions = Object.entries(versionsRaw)
    .map(([version, date]) => ({ version, date, unix: Date.parse(date) }))
    .sort((a, b) => (test(`${a.version} < ${b.version}`) ? -1 : 1))
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
      const versioning = get(request, ['options', 'versioning']) !== false;
      if (versioning) {
        request.params.push(new Enum(apiVersionHeader, 'header', { enums: Object.keys(versions).reverse() }));
      } else {
        // effectively disallowing this header
        request.params.push(new Enum(apiVersionHeader, 'header', { enums: [''], required: false }));
      }
    },
    storeApiVersionMeta: async ({ request, event, context }) => {
      if (request.routed === false) {
        return;
      }
      if (event.httpMethod === 'OPTIONS') {
        return;
      }
      if (apiVersionHeader === undefined) {
        return;
      }
      if (get(request, ['options', 'versioning']) === false) {
        return;
      }
      const apiVersion = event.headers[apiVersionHeader.toLowerCase()];
      if (apiVersion === undefined) {
        throw ApiErrorFn(`Required header "${apiVersionHeader}" missing`, 403);
      }
      if (!VERSION_REGEX.test(apiVersion)) {
        throw ApiErrorFn(`Invalid value "${apiVersion}" for header "${apiVersionHeader}" provided`, 403);
      }
      if (versions[apiVersion] === undefined) {
        throw ApiErrorFn(`Unknown version "${apiVersion}" for header "${apiVersionHeader}" provided`, 403);
      }
      const deprecated = get(request, 'options.deprecated');
      if (deprecated !== undefined && test(`${deprecated} <= ${apiVersion}`)) {
        throw ApiErrorFn(`Endpoint deprecated since version "${deprecated}"`, 403);
      }
      const params = get(request, 'params');
      const pDepr = params.find((p) => (
        p.deprecated !== null
          && test(`${p.deprecated} <= ${apiVersion}`)
          && p.get() !== undefined
      ));
      if (pDepr) {
        throw ApiErrorFn(`Param ${pDepr.name} deprecated since version "${pDepr.deprecated}"`, 403);
      }
      const apiVersionMeta = versions[apiVersion];
      if (apiVersionMeta.isDeprecated) {
        const isSunset = apiVersionMeta.sunsetDate < new Date();
        await onDeprecated({
          request,
          event,
          sunsetDate: apiVersionMeta.sunsetDate,
          isSunset
        });
        if (isSunset && forceSunset === true) {
          throw ApiErrorFn(`Version "${apiVersion}" is sunset as of "${apiVersionMeta.sunsetDate.toUTCString()}"`, 403);
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
      updateDeprecationHeaders(response.headers, { deprecationDate, sunsetDate });
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
      versions: get(options, 'versions', {}),
      onDeprecated: get(options, 'onDeprecated', ({ event, isSunset }) => {
        if (isSunset) {
          logger.warn(`Sunset functionality accessed\n${JSON.stringify(event)}`);
        }
      })
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
        ),
        onDeprecated: Joi.function().optional()
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
    await this.versionManager.storeApiVersionMeta(kwargs);
  }

  async after(kwargs) {
    this.versionManager.updateDeprecationHeaders(kwargs);
  }
}

export default Versioning;
