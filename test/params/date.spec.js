const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing Date Parameter', () => {
  describe('Testing query param', () => {
    const queryParam = api.Date('value', 'query');
    it('Testing valid query parameter', () => {
      expect(queryParam.get({
        queryStringParameters: {
          value: '2019-06-18'
        }
      })).to.equal('2019-06-18');
    });

    it('Testing invalid query parameter (date range)', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: '2019-13-01'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('Testing invalid query parameter (format)', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: '2019/06/18'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    const jsonParam = api.Date('value', 'json');
    it('Testing valid json parameter', () => {
      expect(jsonParam.get({
        body: {
          value: '2019-06-18'
        }
      })).to.equal('2019-06-18');
    });

    it('Testing invalid json parameter (date range)', () => {
      expect(() => jsonParam.get({
        body: {
          value: '2019-13-01'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });

    it('Testing invalid json parameter (format)', () => {
      expect(() => jsonParam.get({
        body: {
          value: '2019/06/18'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing optional param', () => {
    const jsonParamOptional = api.Date('value', 'json', { required: false });
    it('Testing optional json param', () => {
      expect(jsonParamOptional.get({
        body: {}
      })).to.equal(undefined);
    });
  });
});
