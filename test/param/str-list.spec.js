const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing StrList Parameter', () => {
  let queryParam;
  let jsonParam;
  let queryParamEnum;
  let bodyParamEnum;
  before(() => {
    queryParam = api.StrList('list', 'query');
    jsonParam = api.StrList('list', 'json');
    queryParamEnum = api.StrList('list', 'query', { enums: ['enumOne', 'enumTwo', 'enumThree'] });
    bodyParamEnum = api.StrList('list', 'json', { enums: ['enumOne', 'enumTwo', 'enumThree'] });
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
        list: ['123', '345']
      }
    })).to.deep.equal(['123', '345']);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        list: ['123', 213]
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  it('Testing valid enums query parameter', () => {
    expect(queryParamEnum.get({
      queryStringParameters: {
        list: '["enumOne", "enumTwo"]'
      }
    })).to.deep.equal(['enumOne', 'enumTwo']);
  });

  it('Testing invalid enums query parameter', () => {
    expect(() => queryParamEnum.get({
      queryStringParameters: {
        list: '["enumOne", "enumTwo", "enumFour"]'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing valid enums json parameter', () => {
    expect(bodyParamEnum.get({
      body: {
        list: ['enumOne', 'enumTwo']
      }
    })).to.deep.equal(['enumOne', 'enumTwo']);
  });

  it('Testing invalid enums json parameter', () => {
    expect(() => bodyParamEnum.get({
      body: {
        list: ['enumOne', 'enumTwo', 'enumFour']
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  describe('Testing optional parameter "minItemLength"', () => {
    let queryParamInValidMin;
    let bodyParamInValidMin;
    before(() => {
      queryParamInValidMin = api.StrList('list', 'query', { minItemLength: 1 });
      bodyParamInValidMin = api.StrList('list', 'json', { minItemLength: 1 });
    });

    it('Testing invalid min-length of list item in query param', () => {
      expect(() => queryParamInValidMin.get({
        queryStringParameters: {
          list: '["123", ""]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing invalid min-length of list item in json param', () => {
      expect(() => bodyParamInValidMin.get({
        body: {
          list: ['123', '']
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });
  });

  describe('Testing optional parameter "maxItemLength"', () => {
    let queryParamInValidMax;
    let bodyParamInValidMax;
    before(() => {
      queryParamInValidMax = api.StrList('list', 'query', { maxItemLength: 5 });
      bodyParamInValidMax = api.StrList('list', 'json', { maxItemLength: 5 });
    });

    it('Testing invalid max-length of list item in query param', () => {
      expect(() => queryParamInValidMax.get({
        queryStringParameters: {
          list: '["123", "123456"]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing invalid max-length of list item in json param', () => {
      expect(() => bodyParamInValidMax.get({
        body: {
          list: ['123', '123456']
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });
  });
});
