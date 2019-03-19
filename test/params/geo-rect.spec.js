const expect = require('chai').expect;
const api = require('../../src/api').Api();

describe('Testing GeoRect Parameter', () => {
  const queryParam = api.GeoRect('geoRect');
  const jsonParam = api.GeoRect('geoRect', 'json');

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        geoRect: '[-119.491,49.892,-121.491,49.101]'
      }
    })).to.deep.equal([-119.491, 49.892, -121.491, 49.101]);
  });

  it('Testing invalid query parameter', () => {
    [
      '[181,0,0,0]', '[0,91,0,0]', '[0,0,181,0]', '[0,0,0,91]',
      '[-181,0,0,0]', '[0,-91,0,0]', '[0,0,-181,0]', '[0,0,0,-91]',
      '[-1', '[0]'
    ].forEach((geoRect) => {
      expect(() => queryParam.get({
        queryStringParameters: { geoRect }
      }), `GeoRect: ${geoRect}`).to.throw('Invalid Value for query-Parameter "geoRect" provided.');
    });
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        geoRect: [-119.491, 49.892, -121.491, 49.101]
      }
    })).to.deep.equal([-119.491, 49.892, -121.491, 49.101]);
  });

  it('Testing invalid json parameter', () => {
    [
      [181, 0, 0, 0], [0, 91, 0, 0], [0, 0, 181, 0], [0, 0, 0, 91],
      [-181, 0, 0, 0], [0, -91, 0, 0], [0, 0, -181, 0], [0, 0, 0, -91],
      [0]
    ].forEach((geoRect) => {
      expect(() => jsonParam.get({
        body: { geoRect }
      }), `GeoRect: ${geoRect}`).to.throw('Invalid Value for json-Parameter "geoRect" provided.');
    });
  });
});
