const path = require('path');
const fs = require('smart-fs');
const expect = require('chai').expect;
const api = require('./handler').internalApi;

describe('Testing Swagger', () => {
  it('Updating Swagger File with API definitions.', async () => {
    const swaggerFile = path.join(__dirname, 'resources', 'swagger.yml');
    const swaggerContent = await api.generateSwagger();
    const result = fs.smartWrite(swaggerFile, swaggerContent);
    expect(result, 'Swagger file updated').to.equal(false);
  });

  it('Testing Empty Compare', () => {
    expect(JSON.stringify(api.generateSwagger())).to.equal('{}');
  });
});
