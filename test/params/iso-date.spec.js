const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing IsoDate Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamOptional;
  before(() => {
    queryParam = api.IsoDate('value', 'query');
    jsonParam = api.IsoDate('value', 'json');
    jsonParamOptional = api.IsoDate('value', 'json', { required: false });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        value: '2008-09-15T15:53:00+05:00'
      }
    })).to.equal('2008-09-15T15:53:00+05:00');
  });

  it('Testing invalid query parameter (date range)', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        value: '2009-02-30T15:53:00+05:00'
      }
    })).to.throw('Invalid Value for query-Parameter "value" provided.');
  });

  it('Testing invalid query parameter (format)', () => {
    expect(() => queryParam.get({
      queryStringParameters: {
        value: '2008-09-15T15:53:00'
      }
    })).to.throw('Invalid Value for query-Parameter "value" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        value: '2008-09-15T15:53:00+05:00'
      }
    })).to.equal('2008-09-15T15:53:00+05:00');
  });

  it('Testing invalid json parameter (date range)', () => {
    expect(() => jsonParam.get({
      body: {
        value: '2009-02-30T15:53:00+05:00'
      }
    })).to.throw('Invalid Value for json-Parameter "value" provided.');
  });

  it('Testing invalid json parameter (format)', () => {
    expect(() => jsonParam.get({
      body: {
        value: '2008-09-15T15:53:00'
      }
    })).to.throw('Invalid Value for json-Parameter "value" provided.');
  });

  it('Testing optional, undefined json parameter', () => {
    expect(jsonParamOptional.get({
      body: {}
    })).to.equal(undefined);
  });
});
