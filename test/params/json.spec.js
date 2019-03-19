const expect = require('chai').expect;
const api = require('../../src/api').Api();

describe('Testing Json Parameter', () => {
  const queryParam = api.Json('param', api.Joi.object().required());
  const jsonParam = api.Json('param', api.Joi.object().required(), 'json');

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        param: '{"key": "value"}'
      }
    })).to.deep.equal({ key: 'value' });
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        param: { key: 'value' }
      }
    })).to.deep.equal({ key: 'value' });
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        param: 'string'
      }
    })).to.throw('Invalid Value for json-Parameter "param" provided.');
  });
});
