const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing Number Parameter', () => {
  let queryParam;
  let queryParamRestricted;
  let jsonParam;
  let jsonParamRestricted;
  before(() => {
    queryParam = api.Number('number', 'query');
    queryParamRestricted = api.Number('number', 'query', { min: 0, max: 10 });
    jsonParam = api.Number('number', 'json');
    jsonParamRestricted = api.Number('number', 'json', { min: 0, max: 10 });
  });

  it('Testing valid query param', () => {
    expect(queryParam.get({ queryStringParameters: { number: '-12.34' } })).to.equal(-12.34);
  });

  it('Testing invalid query param', () => {
    expect(() => queryParam.get({
      queryStringParameters: { number: 'invalid' }
    })).to.throw('Invalid Value for query-Parameter "number" provided.');
  });

  it('Testing valid, restricted query param', () => {
    expect(queryParamRestricted.get({ queryStringParameters: { number: '1.234' } })).to.equal(1.234);
  });

  it('Testing invalid, restricted query param', () => {
    ['-11', '-1', '11'].forEach((number) => {
      expect(() => queryParamRestricted.get({
        queryStringParameters: { number }
      })).to.throw('Invalid Value for query-Parameter "number" provided.');
    });
  });

  it('Testing valid json param', () => {
    expect(jsonParam.get({
      body: { number: 12.34 }
    })).to.equal(12.34);
  });

  it('Testing invalid json param', () => {
    ['12.34', 'string'].forEach((number) => {
      expect(() => jsonParam.get({ body: { number } }))
        .to.throw('Invalid Value for json-Parameter "number" provided.');
    });
  });

  it('Testing valid, restricted json param', () => {
    expect(jsonParamRestricted.get({
      body: { number: 1.234 }
    })).to.equal(1.234);
  });

  it('Testing invalid, restricted json param', () => {
    [-11, -1, 11].forEach((number) => {
      expect(() => jsonParamRestricted.get({ body: { number } }))
        .to.throw('Invalid Value for json-Parameter "number" provided.');
    });
  });
});
