const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing IntList Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.IntList('list', 'query');
    jsonParam = api.IntList('list', 'json');
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        list: '[10, 20]'
      }
    })).to.deep.equal([10, 20]);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        list: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing invalid float number query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        list: '[10.1, 20]'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        list: [123, 345]
      }
    })).to.deep.equal([123, 345]);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        list: ['123', 213]
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  describe('Testing optional int parameter "minItemValue"', () => {
    let queryParamInValidMin;
    let bodyParamInValidMin;
    before(() => {
      queryParamInValidMin = api.IntList('list', 'query', { minItemValue: 1 });
      bodyParamInValidMin = api.IntList('list', 'json', { minItemValue: 1 });
    });

    it('Testing invalid min-value of list item in query param', () => {
      expect(() => queryParamInValidMin.get({
        queryStringParameters: {
          list: '[0, 1]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing valid min-value of list item in query param', () => {
      expect(queryParamInValidMin.get({
        queryStringParameters: {
          list: '[2, 1]'
        }
      })).to.deep.equal([2, 1]);
    });

    it('Testing invalid min-value of list item in json param', () => {
      expect(() => bodyParamInValidMin.get({
        body: {
          list: [0, 1]
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });

    it('Testing valid min-value of list item in json param', () => {
      expect(bodyParamInValidMin.get({
        body: {
          list: [2, 1]
        }
      })).to.deep.equal([2, 1]);
    });
  });

  describe('Testing optional int parameter "maxItemValue"', () => {
    let queryParamInValidMax;
    let bodyParamInValidMax;
    before(() => {
      queryParamInValidMax = api.IntList('list', 'query', { maxItemValue: 10 });
      bodyParamInValidMax = api.IntList('list', 'json', { maxItemValue: 10 });
    });

    it('Testing invalid max-value of list item in query param', () => {
      expect(() => queryParamInValidMax.get({
        queryStringParameters: {
          list: '[11, 10]'
        }
      })).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing valid max-value of list item in query param', () => {
      expect(queryParamInValidMax.get({
        queryStringParameters: {
          list: '[9, 10]'
        }
      })).to.deep.equal([9, 10]);
    });

    it('Testing invalid max-value of list item in json param', () => {
      expect(() => bodyParamInValidMax.get({
        body: {
          list: [11, 10]
        }
      })).to.throw('Invalid Value for json-Parameter "list" provided.');
    });

    it('Testing valid max-value of list item in json param', () => {
      expect(bodyParamInValidMax.get({
        body: {
          list: [9, 10]
        }
      })).to.deep.equal([9, 10]);
    });
  });
});
