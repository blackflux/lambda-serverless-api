const expect = require('chai').expect;
const Joi = require('joi-strict');
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing JsonList Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.JsonList('param', 'query', { schema: Joi.object() });
    jsonParam = api.JsonList('param', 'json', { schema: Joi.object() });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        param: '[{"key": "value"}]'
      }
    })).to.deep.equal([{ key: 'value' }]);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        param: '[invalid]'
      }
    })).to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing invalid query parameter json parse error', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        param: '[{parse-error]'
      }
    })).to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        param: [{ key: 'value' }]
      }
    })).to.deep.equal([{ key: 'value' }]);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        param: ['string']
      }
    })).to.throw('Invalid Value for json-Parameter "param" provided.');
  });
});
