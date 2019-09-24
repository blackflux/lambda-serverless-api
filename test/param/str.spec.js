const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing Str Parameter', () => {
  describe('Testing query param', () => {
    let queryParam;
    before(() => {
      queryParam = api.Str('value', 'query');
    });

    it('Testing valid query parameter', () => {
      expect(queryParam.get({
        queryStringParameters: {
          value: 'value'
        }
      })).to.equal('value');
    });

    it('Testing invalid query parameter (rejected string)', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: ''
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    let jsonParam;
    before(() => {
      jsonParam = api.Str('value', 'json');
    });

    it('Testing valid json parameter', () => {
      expect(jsonParam.get({
        body: {
          value: 'value'
        }
      })).to.equal('value');
    });

    it('Testing invalid json parameter (rejected string)', () => {
      expect(() => jsonParam.get({
        body: {
          value: 'undefined'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing options params', () => {
    let jsonParamOptional;
    let jsonParamRelaxed;
    before(() => {
      jsonParamOptional = api.Str('value', 'json', { required: false });
      jsonParamRelaxed = api.Str('value', 'json', { relaxed: true });
    });

    it('Testing optional json parameter', () => {
      expect(jsonParamOptional.get({
        body: {}
      })).to.equal(undefined);
    });

    it('Testing relaxed json parameter', () => {
      expect(jsonParamRelaxed.get({
        body: {
          value: 'undefined'
        }
      })).to.equal('undefined');
    });
  });
});
