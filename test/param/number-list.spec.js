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

  describe('Testing optional parameter "minItemValue"', () => {
    let queryParamInValidMin;
    let bodyParamInValidMin;
    before(() => {
      queryParamInValidMin = api.NumberList('list', 'query', { minItemValue: 1 });
      bodyParamInValidMin = api.NumberList('list', 'json', { minItemValue: 1 });
    });

    it('Testing invalid min-value of list item in query param', () => {
      expect(() => queryParamInValidMin.get({
        queryStringParameters: {
          list: '[0, 1, 200]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing valid min-value of list item in query param', () => {
      expect(queryParamInValidMin.get({
        queryStringParameters: {
          list: '[1, 1, 200]'
        }
      })).to.deep.equal([1, 1, 200]);
    });

    it('Testing invalid min-value of list item in json param', () => {
      expect(() => bodyParamInValidMin.get({
        body: {
          list: [0, 1, 200]
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });

    it('Testing valid min-value of list item in json param', () => {
      expect(bodyParamInValidMin.get({
        body: {
          list: [1, 1, 200]
        }
      })).to.deep.equal([1, 1, 200]);
    });
  });

  describe('Testing optional parameter "maxItemValue"', () => {
    let queryParamInValidMax;
    let bodyParamInValidMax;
    before(() => {
      queryParamInValidMax = api.NumberList('list', 'query', { maxItemValue: 100 });
      bodyParamInValidMax = api.NumberList('list', 'json', { maxItemValue: 100 });
    });

    it('Testing invalid max-value of list item in query param', () => {
      expect(() => queryParamInValidMax.get({
        queryStringParameters: {
          list: '[101, 0, 1]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing valid max-value of list item in query param', () => {
      expect(queryParamInValidMax.get({
        queryStringParameters: {
          list: '[98, 99, 100]'
        }
      })).to.deep.equal([98, 99, 100]);
    });

    it('Testing invalid max-value of list item in json param', () => {
      expect(() => bodyParamInValidMax.get({
        body: {
          list: [101, 0, 1]
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });

    it('Testing valid max-value of list item in json param', () => {
      expect(bodyParamInValidMax.get({
        body: {
          list: [98, 99, 100]
        }
      })).to.deep.equal([98, 99, 100]);
    });
  });
});
