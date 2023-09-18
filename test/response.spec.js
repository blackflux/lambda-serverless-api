import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api, ApiError } from '../src/index.js';
import { identity } from './misc.js';

describe('Testing Response', { record: console, timestamp: 1583296617 }, () => {
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

  it('Testing Reimported Endpoint', (done) => {
    const importer = () => {
      api.wrap('GET path/{p1}', [], identity(api));
    };
    expect(() => importer()).to.not.throw();
    expect(() => importer()).to.not.throw();
    done();
  });

  it('Testing header injections', (done) => {
    api = Api({
      responseHeaders: {
        inject: ['date', 'server-timing']
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
        statusCode: 200,
        body: '{}',
        headers: { date: 'Wed, 04 Mar 2020 04:36:57 GMT', 'server-timing': 'total;dur=0' }
      });
      done();
    });
  });

  it('Testing header injections no overwrite', (done) => {
    api = Api({
      responseHeaders: {
        inject: ['date', 'server-timing']
      }
    });
    api.wrap('GET path', [], () => api.JsonResponse({}, 200, { date: 'existing' }));
    api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({
        statusCode: 200,
        body: '{}',
        headers: { date: 'existing', 'server-timing': 'total;dur=0' }
      });
      done();
    });
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

  it('Testing hooks', (done) => {
    api = Api({
      preRouting: () => {},
      preValidation: () => {},
      preResponse: () => {}
    });
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

  it('Testing crash in pre-response', async ({ recorder }) => {
    api = Api({
      preRouting: () => {},
      preValidation: () => {},
      preResponse: () => {
        throw new Error();
      }
    });
    api.wrap('GET path', [], identity(api));
    const [err, resp] = await new Promise((resolve) => {
      api.router({
        httpMethod: 'GET',
        path: '/path',
        requestContext: { identity: { sourceIp: '127.0.0.1' } }
      }, {}, (...args) => resolve(args));
    });
    expect(err).to.equal(null);
    expect(resp).to.deep.equal({
      statusCode: 500,
      body: '{"message":"Internal Server Error"}'
    });
    expect(err).to.equal(null);
    const logs = recorder.get();
    expect(logs.length).to.equal(3);
    expect(logs[0]).to.deep.equal(
      'INFO: 200 GET path\n'
      + '{"event":{"httpMethod":"GET","path":"/path","requestContext":{"identity":{"sourceIp":"127.0.0.1"}},'
      + '"pathParameters":{},"headers":{}},"response":{"statusCode":200,"body":{}}}'
    );
    expect(logs[1]).to.deep.equal(
      'JSON: {"signature":"200 GET path","success":true,"level":"info","timings":{"duration":0},"event":{"'
      + 'httpMethod":"GET","path":"/path","requestContext":{"identity":{"sourceIp":"127.0.0.1"}},"pathParame'
      + 'ters":{},"headers":{}},"response":{"statusCode":200,"body":{}}}'
    );
    expect(logs[2]).to.startsWith(
      'WARNING: Unexpected Exception\n'
      + '{"error":{"generatedMessage":false,"code":"ERR_ASSERTION","actual":false,"expected":true,"operator"'
      + ':"==","name":"AssertionError","message":"Should not throw from afterSuccess() or after()","stack":"'
      + 'AssertionError [ERR_ASSERTION]: Should not throw from afterSuccess() or after()'
    );
  });

  it('Testing no logs', async ({ recorder }) => {
    api = Api({ logger: { logSuccess: false, logError: false } });
    api.wrap('GET path', [], identity(api));
    const [err, resp] = await new Promise((resolve) => {
      api.router({
        httpMethod: 'GET',
        path: '/path',
        requestContext: { identity: { sourceIp: '127.0.0.1' } }
      }, {}, (...args) => resolve(args));
    });
    expect(err).to.equal(null);
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}'
    });
    expect(recorder.get()).to.deep.equal([]);
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
          'access-control-allow-origin': 'https://some-origin.com',
          'access-control-allow-headers': 'content-type,accept,origin,x-custom',
          'access-control-allow-methods': 'GET'
        }
      });
      done();
    });
  });

  it('Testing Default Options Request Fails', async () => {
    api.wrap('GET path', [], identity(api));
    const [err, resp] = await new Promise((resolve) => {
      api.router({
        httpMethod: 'OPTIONS',
        path: '/path',
        requestContext: { identity: { sourceIp: '127.0.0.1' } },
        headers: {
          Origin: 'https://some-origin.com'
        }
      }, {}, (...args) => resolve(args));
    });
    expect(err).to.equal(null);
    expect(resp).to.deep.equal({
      statusCode: 403,
      body: '{"message":"Required header missing"}'
    });
  });

  it('Testing ApiError', (done) => {
    const apiError = api.ApiError();
    expect(apiError instanceof api.ApiErrorClass).to.equal(true);
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
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({ statusCode: 500, body: '{"message":"Internal Server Error"}' });
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
