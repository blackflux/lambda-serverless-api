const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing Strinct Parameter', () => {
  describe('Testing query param', () => {
    const queryParam = api.Strinct('name', 'query');
    it('Testing valid query parameter', () => {
      expect(queryParam.get({
        queryStringParameters: {
          name: 'name'
        }
      })).to.equal('name');
    });

    it('Testing invalid query parameter (rejected string)', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          name: ''
        }
      })).to.throw('Invalid Value for query-Parameter "name" provided.');
    });
  });

  describe('Testing json param', () => {
    const jsonParam = api.Strinct('name', 'json');
    it('Testing valid json parameter', () => {
      expect(jsonParam.get({
        body: {
          name: 'name'
        }
      })).to.equal('name');
    });

    it('Testing invalid json parameter (rejected string)', () => {
      expect(() => jsonParam.get({
        body: {
          name: 'undefined'
        }
      })).to.throw('Invalid Value for json-Parameter "name" provided.');
    });
  });

  describe('Testing optional param', () => {
    const jsonParamOptional = api.Strinct('name', 'json', { required: false });
    it('Testing optional json parameter', () => {
      expect(jsonParamOptional.get({
        body: {}
      })).to.equal(undefined);
    });
  });
});
