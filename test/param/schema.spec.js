const expect = require('chai').expect;
const Joi = require('joi-strict');
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing Schema Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamOptional;
  before(() => {
    queryParam = api.Schema('param', 'query', { schema: Joi.string().valid('value') });
    jsonParam = api.Schema('param', 'json', { schema: Joi.string().valid('value') });
    jsonParamOptional = api.Schema('param', 'json', { schema: Joi.string().valid('value'), required: false });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        param: 'value'
      }
    })).to.equal('value');
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
        param: 'value'
      }
    })).to.equal('value');
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for json-Parameter "param" provided.');
  });

  it('Testing optional, undefined json parameter', () => {
    expect(jsonParamOptional.get({
      body: {}
    })).to.equal(undefined);
  });
});
