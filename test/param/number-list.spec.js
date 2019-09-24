const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing NumberList Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.NumberList('list', 'query');
    jsonParam = api.NumberList('list', 'json');
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        list: '[123.123,345.234]'
      }
    })).to.deep.equal([123.123, 345.234]);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        list: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        list: [123.123, 345.234]
      }
    })).to.deep.equal([123.123, 345.234]);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        list: ['123', 213]
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });
});
