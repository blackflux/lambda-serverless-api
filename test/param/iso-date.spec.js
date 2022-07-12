import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing Iso Date Parameter', () => {
  describe('Testing query param', () => {
    let queryParam;
    before(() => {
      queryParam = api.IsoDate('value', 'query');
    });

    it('Testing valid query parameter', () => {
      expect(queryParam.get('2019-06-18')).to.equal('2019-06-18');
    });

    it('Testing invalid query parameter (date range)', () => {
      expect(() => queryParam.get('2019-02-30')).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('Testing invalid query parameter (format)', () => {
      expect(() => queryParam.get('2019/06/18')).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    let jsonParam;
    before(() => {
      jsonParam = api.IsoDate('value', 'json');
    });

    it('Testing valid json parameter', () => {
      expect(jsonParam.get('2019-06-18')).to.equal('2019-06-18');
    });

    it('Testing invalid json parameter (date range)', () => {
      expect(() => jsonParam.get('2019-02-30')).to.throw('Invalid Value for json-Parameter "value" provided.');
    });

    it('Testing invalid json parameter (format)', () => {
      expect(() => jsonParam.get('2019/06/18')).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing optional param', () => {
    let jsonParamOptional;
    before(() => {
      jsonParamOptional = api.IsoDate('value', 'json', { required: false });
    });

    it('Testing optional json param', () => {
      expect(jsonParamOptional.get(undefined)).to.equal(undefined);
    });
  });
});
