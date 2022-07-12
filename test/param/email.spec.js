import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing Email Parameter', () => {
  describe('Testing query param', () => {
    let queryParam;
    before(() => {
      queryParam = api.Email('value', 'query');
    });

    it('Testing valid query parameter', () => {
      expect(queryParam.get('TEST@test.ca')).to.equal('test@test.ca');
    });

    it('Testing invalid query parameter (rejected string)', () => {
      expect(() => queryParam.get(''))
        .to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    let jsonParam;
    before(() => {
      jsonParam = api.Email('value', 'json');
    });

    it('Testing valid json parameter', () => {
      expect(jsonParam.get('TEST@test.ca')).to.equal('test@test.ca');
    });

    it('Testing invalid json parameter (rejected string)', () => {
      expect(() => jsonParam.get('undefined'))
        .to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });
});
