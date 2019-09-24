const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing Int Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamOptional;
  before(() => {
    queryParam = api.Int('value', 'query');
    jsonParam = api.Int('value', 'json');
    jsonParamOptional = api.Int('value', 'json', { required: false });
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

  describe('Testing optional parameter "max"', () => {
    let queryParamInvalidMax;
    let bodyParamInvalidMax;
    before(() => {
      queryParamInvalidMax = api.Int('value', 'query', { max: 10 });
      bodyParamInvalidMax = api.Int('value', 'json', { max: 10 });
    });

    it('testing invalid max query parameter', () => {
      expect(() => queryParamInvalidMax.get({
        queryStringParameters: {
          value: '11'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('testing invalid max json parameter', () => {
      expect(() => bodyParamInvalidMax.get({
        body: {
          value: 11
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });

  describe('Testing optional parameter "min"', () => {
    let queryParamInvalidMin;
    let bodyParamInvalidMin;
    before(() => {
      queryParamInvalidMin = api.Int('value', 'query', { min: -1 });
      bodyParamInvalidMin = api.Int('value', 'json', { min: -1 });
    });

    it('testing invalid min query parameter', () => {
      expect(() => queryParamInvalidMin.get({
        queryStringParameters: {
          value: '-2'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('testing invalid min json parameter', () => {
      expect(() => bodyParamInvalidMin.get({
        body: {
          value: -2
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });
});
