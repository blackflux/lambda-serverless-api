const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing StrList Parameter', () => {
  const queryParam = api.StrList('list', 'query');
  const jsonParam = api.StrList('list', 'json');
  const queryParamEnum = api.StrList('list', 'query', { enums: ['enumOne', 'enumTwo', 'enumThree'] });
  const bodyParamEnum = api.StrList('list', 'json', { enums: ['enumOne', 'enumTwo', 'enumThree'] });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        list: '["123","345"]'
      }
    })).to.deep.equal(['123', '345']);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        list: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        list: ['123', '345']
      }
    })).to.deep.equal(['123', '345']);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        list: ['123', 213]
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  it('Testing valid enums query parameter', () => {
    expect(queryParamEnum.get({
      queryStringParameters: {
        list: '["enumOne", "enumTwo"]'
      }
    })).to.deep.equal(['enumOne', 'enumTwo']);
  });

  it('Testing invalid enums query parameter', () => {
    expect(() => queryParamEnum.get({
      queryStringParameters: {
        list: '["enumOne", "enumTwo", "enumFour"]'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing valid enums json parameter', () => {
    expect(bodyParamEnum.get({
      body: {
        list: ['enumOne', 'enumTwo']
      }
    })).to.deep.equal(['enumOne', 'enumTwo']);
  });

  it('Testing invalid enums json parameter', () => {
    expect(() => bodyParamEnum.get({
      body: {
        list: ['enumOne', 'enumTwo', 'enumFour']
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });
});
