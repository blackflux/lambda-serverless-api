import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing Str Parameter', () => {
  describe('Testing query param', () => {
    let queryParam;
    before(() => {
      queryParam = api.Str('value', 'query');
    });

    it('Testing valid query parameter', () => {
      expect(queryParam.get('value')).to.equal('value');
    });

    it('Testing invalid query parameter (rejected string)', () => {
      expect(() => queryParam.get('')).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    let jsonParam;
    before(() => {
      jsonParam = api.Str('value', 'json');
    });

    it('Testing valid json parameter', () => {
      expect(jsonParam.get('value')).to.equal('value');
    });

    it('Testing invalid json parameter (rejected string)', () => {
      expect(() => jsonParam.get('undefined')).to.throw('Invalid Value for json-Parameter "value" provided.');
    });

    it('Testing normalize', () => {
      expect(jsonParam.get('a  b')).to.equal('a b');
      expect(jsonParam.get('a   b')).to.equal('a b');
      expect(jsonParam.get('  a   b  ')).to.equal('a b');
      expect(jsonParam.get('a \n b')).to.equal('a\nb');
      expect(jsonParam.get('a \n \n b')).to.equal('a\n\nb');
      expect(jsonParam.get('a   \n   \n   b')).to.equal('a\n\nb');
      expect(jsonParam.get('a\n\nb')).to.equal('a\n\nb');
      expect(jsonParam.get('a \t b')).to.equal('a b');
      expect(jsonParam.get(' b')).to.equal('b');
      expect(jsonParam.get('a ')).to.equal('a');
    });
  });

  describe('Testing options params', () => {
    let jsonParamOptional;
    let jsonParamRelaxed;
    let jsonParamMinLength;
    let jsonParamMaxLength;
    before(() => {
      jsonParamOptional = api.Str('value', 'json', { required: false });
      jsonParamRelaxed = api.Str('value', 'json', { relaxed: true });
      jsonParamMinLength = api.Str('value', 'json', { minLength: 2 });
      jsonParamMaxLength = api.Str('value', 'json', { maxLength: 1 });
    });

    it('Testing optional json parameter', () => {
      expect(jsonParamOptional.get(undefined)).to.equal(undefined);
    });

    it('Testing relaxed json parameter', () => {
      expect(jsonParamRelaxed.get('undefined')).to.equal('undefined');
    });

    it('Testing minLength json parameter valid', () => {
      expect(jsonParamMinLength.get('ab')).to.equal('ab');
    });

    it('Testing minLength json parameter invalid', () => {
      expect(() => jsonParamMinLength.get('a')).to.throw('Invalid Value for json-Parameter "value" provided.');
    });

    it('Testing maxLength json parameter valid', () => {
      expect(jsonParamMaxLength.get('a')).to.equal('a');
    });

    it('Testing maxLength json parameter invalid', () => {
      expect(() => jsonParamMaxLength.get('ab')).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });
});
