const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing List Parameter', () => {
  const queryParam = api.List('list', 'query');
  const jsonParam = api.List('list', 'json');

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        list: '["123","345"]'
      }
    })).to.deep.equal(['123', '345']);
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
        list: ['123', 123]
      }
    })).to.deep.equal(['123', 123]);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        list: {}
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });
});
