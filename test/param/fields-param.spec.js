const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();
const { identity } = require('../misc');

describe('Testing FieldsParam Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.FieldsParam('param', 'query', { fields: ['id', 'user.id', 'user.name'] });
    jsonParam = api.FieldsParam('param', 'json', { fields: () => ['id', 'user.id', 'user.name'] });
  });

  it('Testing valid query param', () => {
    expect(queryParam.get({
      queryStringParameters: {
        param: 'id,user.id,user.name'
      }
    })).to.deep.equal(['id', 'user.id', 'user.name']);
  });

  it('Testing invalid query param', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing valid json param', () => {
    expect(jsonParam.get({
      body: {
        param: 'id,user.id,user.name'
      }
    })).to.deep.equal(['id', 'user.id', 'user.name']);
  });

  it('Testing invalid json param', () => {
    expect(() => jsonParam.get({
      body: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for json-Parameter "param" provided.');
  });

  it('Testing only one autoPrune FieldsParam per request', (done) => {
    expect(() => api.wrap('GET route', [
      api.FieldsParam('fields1', 'query', { paths: ['id'], autoPrune: '', fields: ['id'] }),
      api.FieldsParam('fields2', 'query', { paths: ['id'], autoPrune: '', fields: ['id'] })
    ], identity(api)))
      .to.throw('Only one auto pruning "FieldsParam" per endpoint.');
    done();
  });
});
