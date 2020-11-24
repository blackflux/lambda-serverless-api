const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

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
    expect(queryParam.get({
      queryStringParameters: {
        value: '-43'
      }
    })).to.equal(-43);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        value: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "value" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        value: -43
      }
    })).to.equal(-43);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        value: 'invalid'
      }
    })).to.throw('Invalid Value for json-Parameter "value" provided.');
  });

  it('Testing undefined optional json parameter', () => {
    expect(jsonParamOptional.get({
      body: {}
    })).to.equal(undefined);
  });

  describe('Testing "max" limit', () => {
    let queryParamInvalidMax;
    let bodyParamInvalidMax;
    before(() => {
      queryParamInvalidMax = api.IntShort('value', 'query');
      bodyParamInvalidMax = api.IntShort('value', 'json');
    });

    it('testing invalid max query parameter', () => {
      expect(() => queryParamInvalidMax.get({
        queryStringParameters: {
          value: '32768'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('testing invalid max json parameter', () => {
      expect(() => bodyParamInvalidMax.get({
        body: {
          value: 32768
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
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
      expect(() => queryParamInvalidMin.get({
        queryStringParameters: {
          value: '-32769'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('testing invalid min json parameter', () => {
      expect(() => bodyParamInvalidMin.get({
        body: {
          value: -32769
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing "max" setting ignore', () => {
    let jsonParamMax;
    let jsonParamMin;
    before(() => {
      jsonParamMax = api.IntShort('value', 'json', { max: 10 });
      jsonParamMin = api.IntShort('value', 'json', { max: -10 });
    });

    it('Testing user "max" setting ignored', () => {
      expect(jsonParamMax.get({
        body: {
          value: 11
        }
      })).to.equal(11);
    });

    it('Testing user "min" setting ignored', () => {
      expect(jsonParamMin.get({
        body: {
          value: -11
        }
      })).to.equal(-11);
    });
  });
});
