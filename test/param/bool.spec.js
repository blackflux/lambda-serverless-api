import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

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
    expect(queryParam.get('true')).to.equal(true);
  });

  it('Testing valid query parameter (false)', () => {
    expect(queryParam.get('false')).to.equal(false);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get('invalid')).to.throw('Invalid Value for query-Parameter "enabled" provided.');
  });

  it('Testing valid json parameter (true)', () => {
    expect(jsonParam.get(true)).to.equal(true);
  });

  it('Testing valid json parameter (false)', () => {
    expect(jsonParam.get(false)).to.equal(false);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get(1)).to.throw('Invalid Value for json-Parameter "enabled" provided.');
  });

  it('Testing optional, undefined json parameter', () => {
    expect(jsonParamOptional.get(undefined)).to.equal(undefined);
  });
});
