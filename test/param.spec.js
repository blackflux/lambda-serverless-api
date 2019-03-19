const expect = require('chai').expect;
const api = require('../src/api').Api();

describe('Testing Params', () => {
  it('Testing Error for GET And JSON Param', (done) => {
    expect(() => api.wrap('GET route', [api.Str('name', 'json')], 1))
      .to.throw('Can not use JSON parameter with GET requests.');
    done();
  });

  it('Testing Undefined Path Parameter', (done) => {
    expect(() => api.wrap('GET route/{otherId}', [api.Str('id', 'path')], 1))
      .to.throw('Path Parameter not defined in given path.');
    done();
  });

  it('Testing Unknown Parameter Position', (done) => {
    expect(() => api.wrap('GET route', [api.Str('id', 'unknown')], 1))
      .to.throw('Unknown Parameter Position: unknown');
    done();
  });

  it('Testing only one autoPrune FieldsParam per request', (done) => {
    expect(() => api.wrap('GET route', [
      api.FieldsParam('fields1', { paths: ['id'], autoPrune: true }),
      api.FieldsParam('fields2', { paths: ['id'], autoPrune: true })
    ], 1))
      .to.throw('Only one auto pruning "FieldsParam" per endpoint.');
    done();
  });

  it('Testing Fields Parameter (query)', () => {
    const param = api.FieldsParam('param', { paths: ['id', 'user.id', 'user.name'] });
    expect(param.get({
      queryStringParameters: {
        param: 'id,user.id,user.name'
      }
    })).to.deep.equal('id,user.id,user.name');
    expect(() => param.get({
      queryStringParameters: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing Fields Parameter (json)', () => {
    const param = api.FieldsParam('param', { paths: () => 'id,user(id,name)' }, 'json');
    expect(param.get({
      body: {
        param: 'id,user.id,user.name'
      }
    })).to.deep.equal('id,user.id,user.name');
    expect(() => param.get({
      body: {
        param: 'invalid'
      }
    })).to.throw('Invalid Value for json-Parameter "param" provided.');
  });
});
