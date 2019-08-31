const path = require('path');
const fs = require('smart-fs');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../src/index');
const testApi = require('./handler').internalApi;

describe('Testing Swagger', () => {
  it('Updating Swagger File with API definitions.', async () => {
    const swaggerFile = path.join(__dirname, 'resources', 'swagger.yml');
    const swaggerContent = await testApi.generateSwagger();
    const result = fs.smartWrite(swaggerFile, swaggerContent);
    expect(result, 'Swagger file updated').to.equal(false);
  });

  it('Testing Empty Api', async () => {
    const docs = await api.Api().generateSwagger();
    expect(docs).to.deep.equal({
      swagger: '2.0',
      produces: ['application/json'],
      info: { title: 'Api Name', version: '0.0.1' },
      paths: {}
    });
  });

  it('Testing Route Prefix', async () => {
    const prefixApi = await api.Api({ routePrefix: 'prefix/' });
    prefixApi.wrap('GET uri', [], () => api.JsonResponse({}));
    const docs = await prefixApi.generateSwagger();
    expect(await new Promise((resolve) => prefixApi.router({
      path: '/prefix/uri',
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (_, r) => resolve(r)))).to.deep.equal({
      body: '{}',
      statusCode: 200
    });
    expect(await new Promise((resolve) => prefixApi.router({
      path: '/uri',
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {}, (_, r) => resolve(r)))).to.deep.equal({
      body: '{"message":"Method / Route not allowed"}',
      statusCode: 403
    });
    expect(docs).to.deep.equal({
      swagger: '2.0',
      produces: ['application/json'],
      info: { title: 'Api Name', version: '0.0.1' },
      paths: {
        '/prefix/uri': {
          get: {
            consumes: [
              'application/json'
            ],
            description: '',
            parameters: [],
            responses: {
              default: {
                description: 'Unexpected Error'
              }
            }
          }
        }
      }
    });
  });
});
