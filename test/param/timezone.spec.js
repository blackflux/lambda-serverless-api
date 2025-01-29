import path from 'path';
import fs from 'smart-fs';
import { expect } from 'chai';
import { describe } from 'node-tdd';
import moment from 'moment-timezone';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing Timezone Parameter', () => {
  it('Testing to have an updated timezones list', () => {
    expect(
      fs.smartWrite(path.join(fs.dirname(import.meta.url), '..', '..', 'src', 'resources', 'timezones.js'), [
        'export default [',
        ...moment.tz.names()
          .map((t, i, arr) => (arr.length - 1 === i
            ? `  '${t}'`
            : `  '${t}',`)),
        '];'
      ]),
      'Timezones updated. Please re-run.'
    ).to.equal(false);
  });

  describe('Testing query param', () => {
    let queryParam;

    before(() => {
      queryParam = api.Timezone('value', 'query');
    });

    it('Testing valid query parameter', () => {
      expect(queryParam.get({
        queryStringParameters: {
          value: 'UTC'
        }
      })).to.equal('UTC');
    });

    it('Testing invalid query parameter', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: 'invalid'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('Testing invalid case-sensitive query parameter', () => {
      expect(() => queryParam.get({
        queryStringParameters: {
          value: 'utc'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });

    it('Testing invalid ignored timezone added', () => {
      queryParam = api.Timezone('value', 'query', { enums: ['Extra/Ignored'] });
      expect(() => queryParam.get({
        queryStringParameters: {
          value: 'Extra/Ignored'
        }
      })).to.throw('Invalid Value for query-Parameter "value" provided.');
    });
  });

  describe('Testing json param', () => {
    let jsonParam;

    before(() => {
      jsonParam = api.Timezone('value', 'json');
    });

    it('Testing valid json parameter', () => {
      expect(jsonParam.get({
        body: {
          value: 'UTC'
        }
      })).to.equal('UTC');
    });

    it('Testing invalid json parameter', () => {
      expect(() => jsonParam.get({
        body: {
          value: 'invalid'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });

    it('Testing invalid case-sensitive on json parameter', () => {
      expect(() => jsonParam.get({
        body: {
          value: 'utc'
        }
      })).to.throw('Invalid Value for json-Parameter "value" provided.');
    });
  });
});
