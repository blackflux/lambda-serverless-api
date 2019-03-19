const expect = require('chai').expect;
const api = require('../../src/api').Api();

describe('Testing FieldsParam Parameter', () => {
  const queryParam = api.FieldsParam('param', { paths: ['id', 'user.id', 'user.name'] }, 'query');
  const jsonParam = api.FieldsParam('param', { paths: () => 'id,user(id,name)' }, 'json');

  it('Testing valid query param', () => {
    expect(queryParam.get({
      queryStringParameters: {
        param: 'id,user.id,user.name'
      }
    })).to.deep.equal('id,user.id,user.name');
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
    })).to.deep.equal('id,user.id,user.name');
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
      api.FieldsParam('fields1', { paths: ['id'], autoPrune: true }, 'query'),
      api.FieldsParam('fields2', { paths: ['id'], autoPrune: true }, 'query')
    ], 1))
      .to.throw('Only one auto pruning "FieldsParam" per endpoint.');
    done();
  });
});
