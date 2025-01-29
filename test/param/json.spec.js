import { expect } from 'chai';
import Joi from 'joi-strict';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing Json Parameter', () => {
  let queryParam;
  let jsonParam;

  before(() => {
    queryParam = api.Json('param', 'query', { schema: Joi.object() });
    jsonParam = api.Json('param', 'json', { schema: Joi.object() });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        param: '{"key": "value"}'
      }
    })).to.deep.equal({ key: 'value' });
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        param: { key: 'value' }
      }
    })).to.deep.equal({ key: 'value' });
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        param: 'string'
      }
    })).to.throw('Invalid Value for json-Parameter "param" provided.');
  });
});
