import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing IntShort Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamOptional;
  before(() => {
    queryParam = api.IntShort('value', 'query');
    jsonParam = api.IntShort('value', 'json');
    jsonParamOptional = api.IntShort('value', 'json', { required: false });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get('-43')).to.equal(-43);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get('invalid')).to.throw('Invalid Value for query-Parameter "value" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get(-43)).to.equal(-43);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get('invalid')).to.throw('Invalid Value for json-Parameter "value" provided.');
  });

  it('Testing undefined optional json parameter', () => {
    expect(jsonParamOptional.get(undefined)).to.equal(undefined);
  });

  describe('Testing "max" limit', () => {
    let queryParamInvalidMax;
    let bodyParamInvalidMax;
    before(() => {
      queryParamInvalidMax = api.IntShort('value', 'query');
      bodyParamInvalidMax = api.IntShort('value', 'json');
    });

    it('testing invalid max query parameter', () => {
      expect(() => queryParamInvalidMax.get('32768')).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('testing invalid max json parameter', () => {
      expect(() => bodyParamInvalidMax.get(32768)).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing "min" limit', () => {
    let queryParamInvalidMin;
    let bodyParamInvalidMin;
    before(() => {
      queryParamInvalidMin = api.IntShort('value', 'query');
      bodyParamInvalidMin = api.IntShort('value', 'json');
    });

    it('testing invalid min query parameter', () => {
      expect(() => queryParamInvalidMin.get('-32769')).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('testing invalid min json parameter', () => {
      expect(() => bodyParamInvalidMin.get(-32769)).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing "max" setting ignored', () => {
    let jsonParamMax;
    let jsonParamMin;
    before(() => {
      jsonParamMax = api.IntShort('value', 'json', { max: 10 });
      jsonParamMin = api.IntShort('value', 'json', { max: -10 });
    });

    it('Testing user "max" setting ignored', () => {
      expect(jsonParamMax.get(11)).to.equal(11);
    });

    it('Testing user "min" setting ignored', () => {
      expect(jsonParamMin.get(-11)).to.equal(-11);
    });
  });
});
