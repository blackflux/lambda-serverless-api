import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing Enum Parameter', () => {
  describe('Testing query param', () => {
    let queryParam;

    before(() => {
      queryParam = api.Enum('value', 'query', { enums: ['value', 'item'] });
    });

    it('Testing valid query parameter', () => {
      expect(queryParam.get({
        queryStringParameters: {
          value: 'value'
        }
      })).to.equal('value');
    });

    it('Testing invalid query parameter', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: 'invalid'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    let jsonParam;

    before(() => {
      jsonParam = api.Enum('value', 'json', { enums: ['value', 'item'] });
    });

    it('Testing valid json parameter', () => {
      expect(jsonParam.get({
        body: {
          value: 'value'
        }
      })).to.equal('value');
    });

    it('Testing invalid json parameter', () => {
      expect(() => jsonParam.get({
        body: {
          value: 'invalid'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });
});
