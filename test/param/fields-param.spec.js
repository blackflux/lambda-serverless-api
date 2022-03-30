import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';
import { identity } from '../misc.js';

const api = Api();

describe('Testing FieldsParam Parameter', () => {
  let queryParam;
  let jsonParam;
  let queryParamOptionEnforce;
  before(() => {
    queryParam = api.FieldsParam('param', 'query', { fields: ['id', 'user.id', 'user.name'] });
    jsonParam = api.FieldsParam('param', 'json', { fields: () => ['id', 'user.id', 'user.name'] });
    queryParamOptionEnforce = api.FieldsParam('param', 'query', {
      fields: ['user.id', 'user.name'],
      enforce: ['user.id', 'id']
    });
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

  it('Testing enforce option', () => {
    expect(queryParamOptionEnforce.get({
      queryStringParameters: {
        param: 'user.id,user.name'
      }
    })).to.deep.equal(['user.id', 'user.name', 'id']);
  });
});
