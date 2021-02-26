const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing GeoShape Parameter', () => {
  let queryParam;
  let jsonParam;
  before(() => {
    queryParam = api.GeoShape('geoShape', 'query');
    jsonParam = api.GeoShape('geoShape', 'json');
  });

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

  it('Testing self intersecting geo shape', () => {
    const geoShape = [
      [-125.0266542, 49.6833014], [-125.0270233, 49.6873752], [-125.0033871, 49.6927488], [-124.999281, 49.6995009],
      [-124.991976, 49.6974828], [-124.9972442, 49.7041643], [-125.0126418, 49.7072946], [-124.9955406, 49.7164821],
      [-125.0068513, 49.7217603], [-125.0000207, 49.7251303], [-124.99018, 49.7161021], [-124.9709315, 49.7281433],
      [-124.9780795, 49.7335446], [-124.9661289, 49.7407195], [-124.9553995, 49.7405368], [-124.9555318, 49.7369994],
      [-124.9332033, 49.7390744], [-124.9332961, 49.7337252], [-124.9441426, 49.7337954], [-124.9442591, 49.7301234],
      [-124.9334306, 49.7299554], [-124.93409, 49.7092417], [-124.9453351, 49.7059084], [-124.9439832, 49.6933349],
      [-124.9638652, 49.6879729], [-124.9727982, 49.6954387], [-124.9887705, 49.686857], [-124.9783844, 49.684361],
      [-124.9820719, 49.682206], [-124.9591471, 49.6591949], [-124.964534, 49.6564944], [-124.9576234, 49.6507454],
      [-124.9624746, 49.6526146], [-124.9628386, 49.6475399], [-124.958071, 49.6470086], [-124.9809575, 49.6497937],
      [-124.9811221, 49.6541081], [-124.9935174, 49.6570527], [-125.0052981, 49.6665283], [-125.011942, 49.6606964],
      [-125.0189883, 49.6661599], [-125.0114113, 49.6713383], [-125.0178568, 49.67627], [-125.0272141, 49.6712367],
      [-125.0180838, 49.6764755], [-125.0320134, 49.6816606], [-125.0266542, 49.6833014]];
    expect(() => jsonParam.get({ body: { geoShape } }))
      .to.throw('Invalid Value for json-Parameter "geoShape" provided.');
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
