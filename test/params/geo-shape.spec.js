const expect = require('chai').expect;
const api = require('../../src/index').Api();

describe('Testing GeoShape Parameter', () => {
  const queryParam = api.GeoShape('geoShape', 'query');
  const jsonParam = api.GeoShape('geoShape', 'json');

  it('Testing valid query parameter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        geoShape: '[[0.5,0.5],[0.5,1],[1,1],[1,0.5],[0.5,0.5]]'
      }
    })).to.deep.equal([[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5], [0.5, 0.5]]);
  });

  it('Testing invalid query parameter', () => {
    [
      'invalid', // parse error
      '[[0.5,0.5],[0.5,1],[1,1],[1,0.5]]', // open polygon
      '[[0.5,0.5],[0.5,1],[1,1],[1,1],[1,0.5],[0.5,0.5]]', // degenerate polygon
      '[[0.5,0.5],[0.5,1],[300,1],[1,0.5],[0.5,0.5]]', // invalid point
      '[[0.5,0.5],[0.5,1],[1,300],[1,0.5],[0.5,0.5]]' // invalid point
    ].forEach((geoShape) => {
      expect(() => queryParam.get({
        queryStringParameters: { geoShape }
      })).to.throw('Invalid Value for query-Parameter "geoShape" provided.');
    });
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get({
      body: {
        geoShape: [[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5], [0.5, 0.5]]
      }
    })).to.deep.equal([[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5], [0.5, 0.5]]);
  });

  it('Testing invalid json parameter (generic)', () => {
    [
      [[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5]], // open polygon
      [[0.5, 0.5], [0.5, 1], [1, 1], [1, 1], [1, 0.5], [0.5, 0.5]], // degenerate polygon
      [[0.5, 0.5], [0.5, 1], [300, 1], [1, 0.5], [0.5, 0.5]], // invalid point
      [[0.5, 0.5], [0.5, 1], [1, 300], [1, 0.5], [0.5, 0.5]] // invalid point
    ].forEach((geoShape) => {
      expect(() => jsonParam.get({
        body: { geoShape }
      })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
    });
  });

  it('Testing invalid json parameter (too large)', () => {
    const param = api.GeoShape('geoShape', 'json', { maxPoints: 6 });
    expect(() => param.get({
      body: { geoShape: [[0.5, 0.5], [0.5, 1], [1, 1], [1.1, 1.1], [1.2, 1.2], [1.3, 1.3], [1, 0.5], [0.5, 0.5]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });

  it('Testing invalid json parameter (not clockwise)', () => {
    const param = api.GeoShape('geoShape', 'json', { clockwise: true });
    expect(() => param.get({
      body: { geoShape: [[0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1], [0.5, 0.5]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });

  it('Testing invalid json parameter (not counter clockwise)', () => {
    const param = api.GeoShape('geoShape', 'json', { clockwise: false });
    expect(() => param.get({
      body: { geoShape: [[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5], [0.5, 0.5]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });

  it('Testing invalid json parameter (relaxed disabled)', () => {
    const param = api.GeoShape('geoShape', 'json');
    expect(() => param.get({
      body: { geoShape: [[1, 0], [1, 1], [2, 1], [1, 0]] }
    })).to.throw('Invalid Value for json-Parameter "geoShape" provided.');
  });

  it('Testing valid json parameter (relaxed enabled)', () => {
    const param = api.GeoShape('geoShape', 'json', { relaxed: true });
    expect(param.get({
      body: { geoShape: [[1, 0], [1, 1], [2, 1], [1, 0]] }
    })).to.deep.equal([[1, 0], [1, 1], [2, 1], [1, 0]]);
  });
});
