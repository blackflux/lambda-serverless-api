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

  it('Testing header injections', async () => {
    api = Api({
      responseHeaders: {
        inject: ['date', 'server-timing']
      }
    });
    api.wrap('GET path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}',
      headers: { date: 'Wed, 04 Mar 2020 04:36:57 GMT', 'server-timing': 'total;dur=0' }
    });
  });

  it('Testing header injections no overwrite', async () => {
    api = Api({
      responseHeaders: {
        inject: ['date', 'server-timing']
      }
    });
    api.wrap('GET path', [], () => api.JsonResponse({}, 200, { date: 'existing' }));
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}',
      headers: { date: 'existing', 'server-timing': 'total;dur=0' }
    });
  });

  it('Testing authorizer deny', async () => {
    api = Api({
      preValidation: () => {
        throw ApiError('Unauthorized', 401);
      }
    });
    api.wrap('GET path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 401,
      body: '{"message":"Unauthorized"}'
    });
  });

  it('Testing hooks', async () => {
    api = Api({
      preRouting: () => {},
      preValidation: () => {},
      preResponse: () => {}
    });
    api.wrap('GET path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}'
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
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 500,
      body: '{"message":"Internal Server Error"}'
    });
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
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}'
    });
    expect(recorder.get()).to.deep.equal([]);
  });

  it('Testing cors function (echo)', async () => {
    api = Api({ cors: { allowedOrigins: () => ['*'] } });
    api.wrap('GET path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      headers: {
        Origin: 'https://some-origin.com'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}',
      headers: { 'Access-Control-Allow-Origin': 'https://some-origin.com' }
    });
  });

  it('Testing cors function (empty)', async () => {
    api = Api({});
    api.wrap('GET path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'GET',
      path: '/path',
      headers: {
        Origin: 'https://test.com'
      },
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{}'
    });
  });

  it('Testing Multi Methods for Options Request', async () => {
    api = Api({
      cors: {
        allowedOrigins: () => ['*'],
        allowedHeaders: () => ['x-custom']
      }
    });
    api.wrap('GET path', [], identity(api));
    api.wrap('DELETE path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'OPTIONS',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } },
      headers: {
        Origin: 'https://some-origin.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Accept'
      }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '',
      headers: {
        'access-control-allow-origin': 'https://some-origin.com',
        'access-control-allow-headers': 'content-type,accept,origin,x-custom',
        'access-control-allow-methods': 'GET'
      }
    });
  });

  it('Testing Default Options Request Fails', async () => {
    api.wrap('GET path', [], identity(api));
    const resp = await api.router({
      httpMethod: 'OPTIONS',
      path: '/path',
      requestContext: { identity: { sourceIp: '127.0.0.1' } },
      headers: {
        Origin: 'https://some-origin.com'
      }
    }, {});
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

  it('Testing ApiResponse Integration', async () => {
    const resp = await api.wrap('GET test', [], (event, context) => api.ApiResponse('promiseResponse'))({
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: 'promiseResponse'
    });
  });

  it('Testing ApiError Integration', async () => {
    const resp = await api.wrap('GET test', [], (event, context) => {
      throw api.ApiError('promiseError');
    })({
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 400,
      body: '{"message":"promiseError"}'
    });
  });

  it('Testing Error Integration', async () => {
    const error = new Error('other');
    const resp = await api.wrap('GET test', [], (event, context) => {
      throw error;
    })({
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {});
    expect(resp).to.deep.equal({ statusCode: 500, body: '{"message":"Internal Server Error"}' });
  });

  it('Testing auto field pruning top level', async () => {
    const resp = await api.wrap('GET test', [
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
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{"foo":"bar"}'
    });
  });

  it('Testing auto field pruning with path', async () => {
    const resp = await api.wrap('GET test', [
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
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{"payload":{"foo":"bar"}}'
    });
  });

  it('Testing without autoPrune', async () => {
    const resp = await api.wrap('GET test', [
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
    }, {});
    expect(resp).to.deep.equal({
      statusCode: 200,
      body: '{"foo":"bar","baz":"quz"}'
    });
  });
});
