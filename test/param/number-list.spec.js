import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing NumberList Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.NumberList('list', 'query');
    jsonParam = api.NumberList('list', 'json');
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get('[123.123,345.234]')).to.deep.equal([123.123, 345.234]);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get('invalid')).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get([123.123, 345.234])).to.deep.equal([123.123, 345.234]);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get(['123', 213])).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  describe('Testing optional parameter "minItemValue"', () => {
    let queryParamInValidMin;
    let bodyParamInValidMin;
    before(() => {
      queryParamInValidMin = api.NumberList('list', 'query', { minItemValue: 1.2 });
      bodyParamInValidMin = api.NumberList('list', 'json', { minItemValue: 1.2 });
    });

    it('Testing invalid min-value of list item in query param', () => {
      expect(() => queryParamInValidMin.get('[1, 1.2]')).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing valid min-value of list item in query param', () => {
      expect(queryParamInValidMin.get('[1.2, 3]')).to.deep.equal([1.2, 3]);
    });

    it('Testing invalid min-value of list item in json param', () => {
      expect(() => bodyParamInValidMin.get([1, 1.2])).to.throw('Invalid Value for json-Parameter "list" provided.');
    });

    it('Testing valid min-value of list item in json param', () => {
      expect(bodyParamInValidMin.get([1.2, 3])).to.deep.equal([1.2, 3]);
    });
  });

  describe('Testing optional parameter "maxItemValue"', () => {
    let queryParamInValidMax;
    let bodyParamInValidMax;
    before(() => {
      queryParamInValidMax = api.NumberList('list', 'query', { maxItemValue: 10.3 });
      bodyParamInValidMax = api.NumberList('list', 'json', { maxItemValue: 10.3 });
    });

    it('Testing invalid max-value of list item in query param', () => {
      expect(() => queryParamInValidMax.get('[10.4, 10]')).to.throw('Invalid Value for query-Parameter "list" provided.');
    });

    it('Testing valid max-value of list item in query param', () => {
      expect(queryParamInValidMax.get('[10.3, 9]')).to.deep.equal([10.3, 9]);
    });

    it('Testing invalid max-value of list item in json param', () => {
      expect(() => bodyParamInValidMax.get([10.4, 10])).to.throw('Invalid Value for json-Parameter "list" provided.');
    });

    it('Testing valid max-value of list item in json param', () => {
      expect(bodyParamInValidMax.get([10.3, 9])).to.deep.equal([10.3, 9]);
    });
  });
});
