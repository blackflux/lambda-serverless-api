const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing StrList Parameter', () => {
  const queryParam = api.StrList('list', 'query');
  const jsonParam = api.StrList('list', 'json');
  const queryParamEnum = api.StrList('list', 'query', { enums: ['enumOne', 'enumTwo', 'enumThree'] });
  const bodyParamEnum = api.StrList('list', 'json', { enums: ['enumOne', 'enumTwo', 'enumThree'] });
  const queryParamInValidConstraints = api.StrList('list', 'query', {
    minListItemLength: 1,
    maxListItemLength: 5,
    maxListLength: 3
  });
  const bodyParamInValidConstraints = api.StrList('list', 'json', {
    minListItemLength: 1,
    maxListItemLength: 5,
    maxListLength: 3
  });
  const queryParamInValidMin = api.StrList('list', 'query', { minListItemLength: 1 });
  const bodyParamInValidMin = api.StrList('list', 'json', { minListItemLength: 1 });
  const queryParamInValidMax = api.StrList('list', 'query', { maxListItemLength: 5 });
  const bodyParamInValidMax = api.StrList('list', 'json', { maxListItemLength: 5 });
  const queryParamInValidLength = api.StrList('list', 'query', { maxListLength: 2 });
  const bodyParamInValidLength = api.StrList('list', 'json', { maxListLength: 2 });

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

  it('Testing invalid query parameter with constraints', () => {
    expect(queryParamInValidConstraints.get({
      queryStringParameters: {
        list: '["123", "456"]'
      }
    })).to.deep.equal(['123', '456']);
  });

  it('Testing valid json parameter with constraints', () => {
    expect(bodyParamInValidConstraints.get({
      body: {
        list: ['123', '456']
      }
    })).to.deep.equal(['123', '456']);
  });

  it('Testing invalid query parameter minListItemLength length', () => {
    expect(() => queryParamInValidMin.get({
      queryStringParameters: {
        list: '["123", ""]'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing invalid json parameter minListItemLength length', () => {
    expect(() => bodyParamInValidMin.get({
      body: {
        list: ['123', '']
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  it('Testing invalid query parameter maxListItemLength length', () => {
    expect(() => queryParamInValidMax.get({
      queryStringParameters: {
        list: '["123", "123456"]'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing invalid json parameter maxListItemLength length', () => {
    expect(() => bodyParamInValidMax.get({
      body: {
        list: ['123', '123456']
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });

  it('Testing invalid query parameter maxListLength length', () => {
    expect(() => queryParamInValidLength.get({
      queryStringParameters: {
        list: '["123", "456", "789"]'
      }
    })).to.throw('Invalid Value for query-Parameter "list" provided.');
  });

  it('Testing invalid json parameter maxListLength length', () => {
    expect(() => bodyParamInValidLength.get({
      body: {
        list: ['123', '456', '789']
      }
    })).to.throw('Invalid Value for json-Parameter "list" provided.');
  });
});
