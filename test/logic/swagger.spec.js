import fs from 'smart-fs';
import { expect } from 'chai';
import { describe } from 'node-tdd';
import * as api from '../../src/index.js';
import { internalApi as testApi } from '../handler.js';

describe('Testing Swagger', () => {
  it('Updating Swagger File with API definitions.', async () => {
    const swaggerFile = `${fs.filename(import.meta.url)}_output.yml`;
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
    const prefixApi = await api.Api({ router: { prefix: 'prefix/' } });
    prefixApi.wrap('GET uri', [], () => api.JsonResponse({}));
    const docs = await prefixApi.generateSwagger();
    expect(await prefixApi.router({
      path: '/prefix/uri',
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {})).to.deep.equal({
      body: '{}',
      statusCode: 200
    });
    expect(await prefixApi.router({
      path: '/uri',
      httpMethod: 'GET',
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    }, {})).to.deep.equal({
      body: '{"message":"Method / Route not allowed","messageId":99008}',
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
