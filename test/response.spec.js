const expect = require('chai').expect;
const { describe } = require('node-tdd');
const response = require('../src/response');
const { Api, ApiError } = require('../src/index');
const { identity } = require('./misc');


describe('Testing Response', () => {
  let api;
  beforeEach(() => {
    api = Api({
      cors: {
        allowedOrigins: ['*']
      },
      logger: {
        logSuccess: false
      }
    });
  });

  it('Testing Redefined Endpoint', (done) => {
    api.wrap('GET path/{p1}', [], identity(api));
    expect(() => api.wrap('GET path/{p2}', [], identity(api)))
      .to.throw('Path collision: GET path/{p2}');
    done();
  });

  it('Testing authorizer deny', (done) => {
    api = Api({
      preValidation: () => {
        throw ApiError('Unauthorized', 401);
      }
    });
    api.wrap('GET path', [], identity(api));
    api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 401,
        body: '{"message":"Unauthorized"}'
      });
      done();
    });
  });

  it('Testing authorizer ok', (done) => {
    api = Api({ preValidation: () => {} });
    api.wrap('GET path', [], identity(api));
    api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}'
      });
      done();
    });
  });

  it('Testing cors function (echo)', (done) => {
    api = Api({ cors: { allowedOrigins: () => ['*'] } });
    api.wrap('GET path', [], identity(api));
    api.router({
      httpMethod: 'GET',
      path: '/path',
      headers: {
        Origin: 'https://some-origin.com'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}',
        headers: { 'Access-Control-Allow-Origin': 'https://some-origin.com' }
      });
      done();
    });
  });

  it('Testing cors function (empty)', (done) => {
    api = Api({});
    api.wrap('GET path', [], identity(api));
    api.router({
      httpMethod: 'GET',
      path: '/path',
      headers: {
        Origin: 'https://test.com'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}'
      });
      done();
    });
  });

  it('Testing Multi Methods for Options Request', (done) => {
    api = Api({
      cors: {
        allowedOrigins: () => ['*'],
        allowedHeaders: () => ['x-custom']
      }
    });
    api.wrap('GET path', [], identity(api));
    api.wrap('DELETE path', [], identity(api));
    api.router({
      httpMethod: 'OPTIONS',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } },
      headers: {
        Origin: 'https://some-origin.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Accept'
      }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '',
        headers: {
          'Access-Control-Allow-Origin': 'https://some-origin.com',
          'Access-Control-Allow-Headers': 'content-type,accept,x-custom',
          'Access-Control-Allow-Methods': 'GET'
        }
      });
      done();
    });
  });

  it('Testing Default Options Request Fails', async () => {
    api.wrap('GET path', [], identity(api));
    const [err, resp] = await new Promise((resolve) => api.router({
      httpMethod: 'OPTIONS',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } },
      headers: {
        Origin: 'https://some-origin.com'
      }
    }, {}, (...args) => resolve(args)));
    expect(err).to.equal(null);
    expect(resp).to.deep.equal({
      statusCode: 403,
      body: '{"message":"Required header missing"}'
    });
  });

  it('Testing ApiError', (done) => {
    const apiError = response.ApiError();
    expect(apiError instanceof response.ApiErrorClass).to.equal(true);
    done();
  });

  it('Testing ApiResponse Integration', (done) => {
    api.wrap('GET test', [], (event, context) => api.ApiResponse('promiseResponse'))({
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: 'promiseResponse'
      });
      done();
    });
  });

  it('Testing ApiError Integration', (done) => {
    api.wrap('GET test', [], (event, context) => {
      throw api.ApiError('promiseError');
    })({
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 400,
        body: '{"message":"promiseError"}'
      });
      done();
    });
  });


  it('Testing Error Integration', (done) => {
    const error = new Error('other');
    api.wrap('GET test', [], (event, context) => {
      throw error;
    })({
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(error);
      expect(resp).to.equal(undefined);
      done();
    });
  });

  it('Testing auto field pruning top level', (done) => {
    api.wrap('GET test', [
      api.FieldsParam('fields', 'query', { fields: ['foo'], autoPrune: '' })
    ], (event, context) => api.JsonResponse({
      foo: 'bar',
      baz: 'quz'
    }))({
      httpMethod: 'GET',
      queryStringParameters: {
        fields: 'foo'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.be.a('null');
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{"foo":"bar"}'
      });
      done();
    });
  });

  it('Testing auto field pruning with path', (done) => {
    api.wrap('GET test', [
      api.FieldsParam('fields', 'query', { fields: ['foo'], autoPrune: 'payload' })
    ], (event, context) => api.JsonResponse({
      payload: {
        foo: 'bar',
        baz: 'quz'
      }
    }))({
      httpMethod: 'GET',
      queryStringParameters: {
        fields: 'foo'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.be.a('null');
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{"payload":{"foo":"bar"}}'
      });
      done();
    });
  });

  it('Testing without autoPrune', (done) => {
    api.wrap('GET test', [
      api.FieldsParam('fields', 'query', { fields: ['foo'] })
    ], (event, context) => api.JsonResponse({
      foo: 'bar',
      baz: 'quz'
    }))({
      httpMethod: 'GET',
      queryStringParameters: {
        fields: 'foo'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.be.a('null');
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{"foo":"bar","baz":"quz"}'
      });
      done();
    });
  });
});
