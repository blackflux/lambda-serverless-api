const expect = require('chai').expect;
const response = require('../src/response');
const { Api } = require('../src/index');

describe('Testing Response', () => {
  let api;
  beforeEach(() => {
    api = Api({ defaultHeaders: { 'X-Custom-Header': 'header-value' } });
  });

  it('Testing Redefined Endpoint', (done) => {
    api.wrap('GET path/{p1}', [], 10);
    expect(() => api.wrap('GET path/{p2}', [], 10))
      .to.throw('Path collision: GET path/{p2}');
    done();
  });

  it('Testing preRequestHook (log)', (done) => {
    let lastEvent = null;
    api = Api({
      preRequestHook: (event) => {
        lastEvent = event;
      }
    });
    api.wrap('GET path', [], 10, () => api.JsonResponse({}));
    api.router({ httpMethod: 'GET', path: '/path' }, {}, (err, resp) => {
      expect(lastEvent).to.deep.equal({
        httpMethod: 'GET',
        path: '/path',
        pathParameters: {}
      });
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}'
      });
      done();
    });
  });

  it('Testing preRequestHook (error)', (done) => {
    api = Api({
      preRequestHook: () => {
        throw api.ApiError('Some Error');
      }
    });
    api.wrap('GET path', [], 10);
    api.router({ httpMethod: 'GET', path: '/path' }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 400,
        body: '{"message":"Some Error"}'
      });
      done();
    });
  });

  it('Testing defaultHeaders function (echo)', (done) => {
    api = Api({ defaultHeaders: headers => headers });
    api.wrap('GET path', [], 10, () => api.JsonResponse({}));
    api.router({
      httpMethod: 'GET',
      path: '/path',
      headers: {
        'X-Custom-Header': 'header-value'
      }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}',
        headers: { xCustomHeader: 'header-value' }
      });
      done();
    });
  });

  it('Testing defaultHeaders function (empty)', (done) => {
    api = Api({ defaultHeaders: headers => headers });
    api.wrap('GET path', [], 10, () => api.JsonResponse({}));
    api.router({ httpMethod: 'GET', path: '/path' }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}'
      });
      done();
    });
  });

  it('Testing Multi Methods for Options Request', (done) => {
    api = Api({ preflightCheck: args => args });
    api.wrap('GET path', [], 10);
    api.wrap('DELETE path', [], 10);
    api.router({ httpMethod: 'OPTIONS', path: '/path' }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '',
        headers: {
          path: 'path',
          allowedMethods: ['OPTIONS', 'GET', 'DELETE']
        }
      });
      done();
    });
  });

  it('Testing Default Options Request Fails', (done) => {
    api.wrap('GET path', [], 10);
    api.router({ httpMethod: 'OPTIONS', path: '/path' }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 403,
        body: '',
        headers: { 'X-Custom-Header': 'header-value' }
      });
      done();
    });
  });

  it('Testing ApiError', (done) => {
    const apiError = response.ApiError();
    expect(apiError instanceof response.ApiErrorClass).to.equal(true);
    done();
  });

  it('Testing ApiResponse Integration', (done) => {
    api.wrap('GET test', [], 10, (event, context, rb) => rb.warning('123')
      .then(() => api.ApiResponse('promiseResponse')).catch(done.fail))({
      httpMethod: 'GET'
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: 'promiseResponse',
        headers: { 'X-Custom-Header': 'header-value' }
      });
      done();
    });
  });

  it('Testing ApiError Integration', (done) => {
    api.wrap('GET test', [], 10, (event, context, rb) => rb.warning('123').then(() => {
      throw api.ApiError('promiseError');
    }).catch(done.fail))({
      httpMethod: 'GET'
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 400,
        body: '{"message":"promiseError"}',
        headers: { 'X-Custom-Header': 'header-value' }
      });
      done();
    });
  });


  it('Testing Error Integration', (done) => {
    const error = new Error('other');
    api.wrap('GET test', [], 10, (event, context, rb) => rb.warning('123').then(() => {
      throw error;
    }).catch(done.fail))({
      httpMethod: 'GET'
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(error);
      expect(resp).to.equal(undefined);
      done();
    });
  });

  it('Testing auto field pruning', (done) => {
    api.wrap('GET test', [
      api.FieldsParam('fields', 'query', { fields: ['foo'], autoPrune: true })
    ], 10, (event, context, rb) => rb.warning('123')
      .then(() => api.JsonResponse({
        foo: 'bar',
        baz: 'quz'
      }))
      .catch(done.fail))({
      httpMethod: 'GET',
      queryStringParameters: {
        fields: 'foo'
      }
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.be.a('null');
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{"foo":"bar"}',
        headers: { 'X-Custom-Header': 'header-value' }
      });
      done();
    });
  });

  it('Testing auto field pruning with path', (done) => {
    api.wrap('GET test', [
      api.FieldsParam('fields', 'query', { fields: ['foo'], autoPrune: true, autoPrunePath: 'payload' })
    ], 10, (event, context, rb) => rb.warning('123')
      .then(() => api.JsonResponse({
        payload: {
          foo: 'bar',
          baz: 'quz'
        }
      }))
      .catch(done.fail))({
      httpMethod: 'GET',
      queryStringParameters: {
        fields: 'foo'
      }
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.be.a('null');
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{"payload":{"foo":"bar"}}',
        headers: { 'X-Custom-Header': 'header-value' }
      });
      done();
    });
  });

  it('Testing pruneResponse false', (done) => {
    api.wrap('GET test', [
      api.FieldsParam('fields', 'query', { fields: ['foo'], autoPrune: false })
    ], 10, (event, context, rb) => rb.warning('123')
      .then(() => api.JsonResponse({
        foo: 'bar',
        baz: 'quz'
      }))
      .catch(done.fail))({
      httpMethod: 'GET',
      queryStringParameters: {
        fields: 'foo'
      }
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.be.a('null');
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{"foo":"bar","baz":"quz"}',
        headers: { 'X-Custom-Header': 'header-value' }
      });
      done();
    });
  });
});
