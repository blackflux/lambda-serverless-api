const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing List Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.List('list', 'query');
    jsonParam = api.List('list', 'json');
  });

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

  describe('Testing optional parameter "maxItems"', () => {
    let queryParamInValidLength;
    let bodyParamInValidLength;
    before(() => {
      queryParamInValidLength = api.StrList('list', 'query', { maxItems: 2 });
      bodyParamInValidLength = api.StrList('list', 'json', { maxItems: 2 });
    });

    it('Testing invalid length of list in query param', () => {
      expect(() => queryParamInValidLength.get({
        queryStringParameters: {
          list: '["123", "456", "789"]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing invalid length of list in json param', () => {
      expect(() => bodyParamInValidLength.get({
        body: {
          list: ['123', '456', '789']
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });
  });

  describe('Testing optional parameter "minItems"', () => {
    let queryParamInValidLength;
    let bodyParamInValidLength;
    before(() => {
      queryParamInValidLength = api.StrList('list', 'query', { minItems: 2 });
      bodyParamInValidLength = api.StrList('list', 'json', { minItems: 2 });
    });

    it('Testing invalid min length of list in query param', () => {
      expect(() => queryParamInValidLength.get({
        queryStringParameters: {
          list: '["123"]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing invalid min length of list in json param', () => {
      expect(() => bodyParamInValidLength.get({
        body: {
          list: ['123']
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });
  });
});
