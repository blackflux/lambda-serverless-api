const expect = require('chai').expect;
const api = require('../../src/api').Api();

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
});
