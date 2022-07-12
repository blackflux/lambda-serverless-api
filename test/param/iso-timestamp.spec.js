import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing IsoTimestamp Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamOptional;
  before(() => {
    queryParam = api.IsoTimestamp('value', 'query');
    jsonParam = api.IsoTimestamp('value', 'json');
    jsonParamOptional = api.IsoTimestamp('value', 'json', { required: false });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get('2008-09-15T15:53:00+05:00')).to.equal('2008-09-15T10:53:00.000Z');
  });

  it('Testing invalid query parameter (date range)', () => {
    expect(() => queryParam.get('2009-02-30T15:53:00+05:00'))
      .to.throw('Invalid Value for query-Parameter "value" provided.');
  });

  it('Testing invalid query parameter (format)', () => {
    expect(() => queryParam.get('2008-09-15T15:53:00'))
      .to.throw('Invalid Value for query-Parameter "value" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get('2008-09-15T15:53:00+05:00')).to.equal('2008-09-15T10:53:00.000Z');
  });

  it('Testing invalid json parameter (date range)', () => {
    expect(() => jsonParam.get('2009-02-30T15:53:00+05:00'))
      .to.throw('Invalid Value for json-Parameter "value" provided.');
  });

  it('Testing invalid json parameter (format)', () => {
    expect(() => jsonParam.get('2008-09-15T15:53:00'))
      .to.throw('Invalid Value for json-Parameter "value" provided.');
  });

  it('Testing optional, undefined json parameter', () => {
    expect(jsonParamOptional.get(undefined)).to.equal(undefined);
  });
});
