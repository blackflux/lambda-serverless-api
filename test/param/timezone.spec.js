const path = require('path');
const expect = require('chai').expect;
const fs = require('smart-fs');
const { describe } = require('node-tdd');
const moment = require('moment-timezone');
const api = require('../../src/index').Api();

describe('Testing Timezone Parameter', () => {
  it('Testing to have an updated timezones list', () => {
    expect(
      fs.smartWrite(path.join(__dirname, '..', '..', 'src', 'resources', 'timezones.json'), moment.tz.names()),
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
