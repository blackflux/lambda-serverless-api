const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing GeoPoint Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamRelaxed;
  before(() => {
    queryParam = api.GeoPoint('geoPoint', 'query');
    jsonParam = api.GeoPoint('geoPoint', 'json');
    jsonParamRelaxed = api.GeoPoint('geoPoint', 'json', { relaxed: true });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        geoPoint: '[-119.491,49.892]'
      }
    })).to.deep.equal([-119.491, 49.892]);
  });

  it('Testing invalid query parameter', () => {
    ['[-181,0.5]', '[181,0.5]', '[0.5,-91]', '[0.5,91]', '[0.5,0.5,0.5]'].forEach((geoPoint) => {
      expect(() => queryParam.get({
        queryStringParameters: { geoPoint }
      }), `GeoPoint: ${geoPoint}`).to.throw('Invalid Value for query-Parameter "geoPoint" provided.');
    });
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        geoPoint: [-119.491, 49.892]
      }
    })).to.deep.equal([-119.491, 49.892]);
  });

  it('Testing invalid json parameter', () => {
    [[-181, 0.5], [181, 0.5], [0.5, -91], [0.5, 91], [0.5, 0.5, 0.5], '0.5,0'].forEach((geoPoint) => {
      expect(() => jsonParam.get({
        body: { geoPoint }
      }), `GeoPoint: ${geoPoint}`).to.throw('Invalid Value for json-Parameter "geoPoint" provided.');
    });
  });

  it('Testing invalid json parameter (relaxed disabled)', () => {
    expect(() => jsonParam.get({
      body: {
        geoPoint: [0, 0]
      }
    })).to.throw('Invalid Value for json-Parameter "geoPoint" provided.');
  });

  it('Testing valid json parameter (relaxed enabled)', () => {
    expect(jsonParamRelaxed.get({
      body: {
        geoPoint: [0, 0]
      }
    })).to.deep.equal([0, 0]);
  });
});
