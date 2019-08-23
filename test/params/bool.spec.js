const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing Bool Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamOptional;
  before(() => {
    queryParam = api.Bool('enabled', 'query');
    jsonParam = api.Bool('enabled', 'json');
    jsonParamOptional = api.Bool('enabled', 'json', { required: false });
  });

  it('Testing valid query parameter (true)', () => {
    expect(queryParam.get({
      queryStringParameters: {
        enabled: 'true'
      }
    })).to.equal(true);
  });

  it('Testing valid query parameter (false)', () => {
    expect(queryParam.get({
      queryStringParameters: {
        enabled: 'false'
      }
    })).to.equal(false);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        enabled: 'invalid'
      }
    })).to.throw('Invalid Value for query-Parameter "enabled" provided.');
  });

  it('Testing valid json parameter (true)', () => {
    expect(jsonParam.get({
      body: {
        enabled: true
      }
    })).to.equal(true);
  });

  it('Testing valid json parameter (false)', () => {
    expect(jsonParam.get({
      body: {
        enabled: false
      }
    })).to.equal(false);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get({
      body: {
        enabled: 1
      }
    })).to.throw('Invalid Value for json-Parameter "enabled" provided.');
  });

  it('Testing optional, undefined json parameter', () => {
    expect(jsonParamOptional.get({
      body: {}
    })).to.equal(undefined);
  });
});
