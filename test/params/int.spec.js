const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing Int Parameter', () => {
  const queryParam = api.Int('value', 'query');
  const jsonParam = api.Int('value', 'json');
  const jsonParamOptional = api.Int('value', 'json', { required: false });

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
    const queryParamInvalidMax = api.Int('value', 'query', { max: 10 });
    const bodyParamInvalidMax = api.Int('value', 'json', { max: 10 });

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
    const queryParamInvalidMin = api.Int('value', 'query', { min: -1 });
    const bodyParamInvalidMin = api.Int('value', 'json', { min: -1 });

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
