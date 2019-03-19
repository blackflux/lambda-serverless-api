const expect = require('chai').expect;
const api = require('../../src/api').Api();

describe('Testing GeoShape Parameter', () => {
  const queryParam = api.GeoShape('geoShape');
  const jsonParam = api.GeoShape('geoShape', {}, 'json');

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        geoShape: '[[0,0],[0,1],[1,1],[1,0],[0,0]]'
      }
    })).to.deep.equal([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]);
  });

  it('Testing invalid query parameter', () => {
    [
      'invalid', // parse error
      '[[0,0],[0,1],[1,1],[1,0]]', // open polygon
      '[[0,0],[0,1],[1,1],[1,1],[1,0],[0,0]]', // degenerate polygon
      '[[0,0],[0,1],[300,1],[1,0],[0,0]]', // invalid point
      '[[0,0],[0,1],[1,300],[1,0],[0,0]]' // invalid point
    ].forEach((geoShape) => {
      expect(() => queryParam.get({
        queryStringParameters: { geoShape }
      })).to.throw('Invalid Value for query-Parameter "geoShape" provided.');
    });
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        geoShape: [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
      }
    })).to.deep.equal([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]);
  });

  it('Testing invalid json parameter (generic)', () => {
    [
      [[0, 0], [0, 1], [1, 1], [1, 0]], // open polygon
      [[0, 0], [0, 1], [1, 1], [1, 1], [1, 0], [0, 0]], // degenerate polygon
      [[0, 0], [0, 1], [300, 1], [1, 0], [0, 0]], // invalid point
      [[0, 0], [0, 1], [1, 300], [1, 0], [0, 0]] // invalid point
    ].forEach((geoShape) => {
      expect(() => jsonParam.get({
        body: { geoShape }
      })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
    });
  });

  it('Testing invalid json parameter (too large)', () => {
    const param = api.GeoShape('geoShape', { maxPoints: 6 }, 'json');
    expect(() => param.get({
      body: { geoShape: [[0, 0], [0, 1], [1, 1], [1.1, 1.1], [1.2, 1.2], [1.3, 1.3], [1, 0], [0, 0]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });

  it('Testing invalid json parameter (not clockwise)', () => {
    const param = api.GeoShape('geoShape', { clockwise: true }, 'json');
    expect(() => param.get({
      body: { geoShape: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });

  it('Testing invalid json parameter (not counter clockwise)', () => {
    const param = api.GeoShape('geoShape', { clockwise: false }, 'json');
    expect(() => param.get({
      body: { geoShape: [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });
});
