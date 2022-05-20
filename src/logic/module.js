import assert from 'assert';
import path from 'path';
import get from 'lodash.get';
import fs from 'smart-fs';
import { logger, abbrev } from 'lambda-monitor-logger';
import AutoPrune from '../plugin/auto-prune.js';
import Cors from '../plugin/cors.js';
import Logger from '../plugin/logger.js';
import ParamParser from '../plugin/param-parser.js';
import PreLogic from '../plugin/pre-logic.js';
import PreProcessor from '../plugin/pre-processor.js';
import PreResponse from '../plugin/pre-response.js';
import PreRouting from '../plugin/pre-routing.js';
import PreValidation from '../plugin/pre-validation.js';
import RateLimit from '../plugin/rate-limit.js';
import ResponseHeaders from '../plugin/response-headers.js';
import Robots from '../plugin/robots.js';
import Router from '../plugin/router.js';
import Validator from '../plugin/validator.js';
import Versioning from '../plugin/versioning.js';

const handleError = (error, plugin) => {
  if (!error.isApiResponse) {
    logger.warn([
      error.message,
      abbrev({
        context: 'lambda-serverless-api',
        plugin: plugin.constructor.name,
        error
      }, {
        stripLineBreaks: false,
        replace: [
          [path.join(fs.dirname(import.meta.url), '..'), '<root>'],
          [process.env.TEST_SEED, '<seed>']
        ]
      })
    ].join('\n'));
  }
  throw error;
};

export class Module {
  constructor(options) {
    const plugins = [
      AutoPrune,
      Cors,
      Logger,
      ParamParser,
      PreLogic,
      PreProcessor,
      PreResponse,
      PreRouting,
      PreValidation,
      RateLimit,
      ResponseHeaders,
      Robots,
      Router,
      Validator,
      Versioning
    ]
      .sort((P1, P2) => (P1.weight() - P2.weight()) || P1.name.localeCompare(P2.name))
      .map((P) => [P, P.schema()]);
    this.schemas = plugins.map(([_, schema]) => schema);
    this.plugins = plugins.map(([P, schema]) => {
      const schemaPath = Object.keys(schema);
      assert(schemaPath.length === 1);
      return new P(get(options, schemaPath[0], {}));
    });
    this.executeAsync = async (fn, kwargs) => {
      for (let idx = 0; idx < this.plugins.length; idx += 1) {
        // eslint-disable-next-line no-await-in-loop
        const resp = await this.plugins[idx][fn](kwargs)
          .catch((error) => handleError(error, this.plugins[idx]));
        if (![null, undefined].includes(resp)) {
          return resp;
        }
      }
      return null;
    };
    this.executeSync = (fn, kwargs) => {
      for (let idx = 0; idx < this.plugins.length; idx += 1) {
        try {
          const resp = this.plugins[idx][fn](kwargs);
          assert(resp === undefined, 'Plugin must not return from this function');
        } catch (error) {
          handleError(error, this.plugins[idx]);
        }
      }
      return null;
    };
  }

  getSchemas() {
    return this.schemas;
  }

  getPlugins() {
    return this.plugins;
  }

  beforeRegister(kwargs) {
    return this.executeSync('beforeRegister', kwargs);
  }

  afterRegister(kwargs) {
    return this.executeSync('afterRegister', kwargs);
  }

  async beforeRouting(kwargs) {
    return this.executeAsync('beforeRouting', kwargs);
  }

  async onUnrouted(kwargs) {
    return this.executeAsync('onUnrouted', kwargs);
  }

  async before(kwargs) {
    return this.executeAsync('before', kwargs);
  }

  async after(kwargs) {
    return this.executeAsync('after', kwargs);
  }

  async afterSuccess(kwargs) {
    return this.executeAsync('afterSuccess', kwargs);
  }
}
