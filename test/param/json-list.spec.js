import { expect } from 'chai';
import Joi from 'joi-strict';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing JsonList Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.JsonList('param', 'query', { schema: Joi.object() });
    jsonParam = api.JsonList('param', 'json', { schema: Joi.object() });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get('[{"key": "value"}]')).to.deep.equal([{ key: 'value' }]);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get('[invalid]'))
      .to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing invalid query parameter json parse error', () => {
    expect(() => queryParam.get('[{parse-error]'))
      .to.throw('Invalid Value for query-Parameter "param" provided.');
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get([{ key: 'value' }])).to.deep.equal([{ key: 'value' }]);
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get(['string']))
      .to.throw('Invalid Value for json-Parameter "param" provided.');
  });
});
