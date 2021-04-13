const expect = require('chai').expect;
const { describe } = require('node-tdd');
const api = require('../../src/index').Api();

describe('Testing GeoPoly Parameter', () => {
  let queryParam;
  let jsonParam;
  let clockwisePolygon;
  let counterClockwisePolygon;

  before(() => {
    queryParam = api.GeoPoly('geoPoly', 'query');
    jsonParam = api.GeoPoly('geoPoly', 'json');
    clockwisePolygon = [[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5], [0.5, 0.5]];
    counterClockwisePolygon = [[0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1], [0.5, 0.5]];
  });

  it('Testing valid query parameter with only perimeter', () => {
    expect(queryParam.get({
      queryStringParameters: {
        geoPoly: JSON.stringify([counterClockwisePolygon, clockwisePolygon])
      }
    })).to.deep.equal([counterClockwisePolygon, clockwisePolygon]);
  });

  it('Testing valid query parameter with holes', () => {
    expect(queryParam.get({
      queryStringParameters: {
        geoPoly: JSON.stringify([counterClockwisePolygon, clockwisePolygon])
      }
    })).to.deep.equal([counterClockwisePolygon, clockwisePolygon]);
  });

  it('Testing valid json parameter with only perimeter', () => {
    expect(jsonParam.get({
      body: {
        geoPoly: [counterClockwisePolygon]
      }
    })).to.deep.equal([counterClockwisePolygon]);
  });

  it('Testing valid json parameter with holes', () => {
    expect(jsonParam.get({
      body: {
        geoPoly: [counterClockwisePolygon, clockwisePolygon]
      }
    })).to.deep.equal([counterClockwisePolygon, clockwisePolygon]);
  });

  it('Testing query parameter with perimeter polygon invalid (clockwise)', () => {
    expect(() => queryParam.get({
      queryStringParameters: { geoPoly: JSON.stringify([clockwisePolygon]) }
    })).to.throw('Invalid Value for query-Parameter "geoPoly" provided.');
  });

  it('Testing query parameter with holes polygon invalid (counter clockwise)', () => {
    expect(() => queryParam.get({
      queryStringParameters: { geoPoly: JSON.stringify([counterClockwisePolygon, counterClockwisePolygon]) }
    })).to.throw('Invalid Value for query-Parameter "geoPoly" provided.');
  });

  it('Testing json parameter with perimeter polygon invalid (clockwise)', () => {
    expect(() => jsonParam.get({
      body: {
        geoPoly: [clockwisePolygon]
      }
    })).to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });

  it('Testing json parameter with holes polygon invalid (counter clockwise)', () => {
    expect(() => jsonParam.get({
      body: {
        geoPoly: [counterClockwisePolygon, counterClockwisePolygon]
      }
    })).to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });

  it('Testing valid json parameter (maxHoles)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxHoles: 1 });
    expect(param.get({
      body: { geoPoly: [counterClockwisePolygon, clockwisePolygon] }
    })).to.deep.equal([counterClockwisePolygon, clockwisePolygon]);
  });

  it('Testing valid json parameter (maxPointsTotal)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsTotal: 10 });
    expect(param.get({
      body: { geoPoly: [counterClockwisePolygon, clockwisePolygon] }
    })).to.deep.equal([counterClockwisePolygon, clockwisePolygon]);
  });

  it('Testing valid json parameter (maxPointsPerShape)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsPerShape: 5 });
    expect(param.get({
      body: { geoPoly: [counterClockwisePolygon] }
    })).to.deep.equal([counterClockwisePolygon]);
  });

  it('Testing valid json parameter (maxPointsPerHole)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsPerHole: 5 });
    expect(param.get({
      body: { geoPoly: [counterClockwisePolygon, clockwisePolygon] }
    })).to.deep.equal([counterClockwisePolygon, clockwisePolygon]);
  });

  it('Testing valid json parameter (maxPoints)', () => {
    const param = api.GeoPoly('geoPolicy', 'json', { maxPoints: 8 });
    expect(param.get({
      body: { geoPolicy: [[[0.5, 0.5], [1, 0.5], [1.3, 1.3], [1.2, 1.2], [1.1, 1.1], [1, 1], [0.5, 1], [0.5, 0.5]]] }
    })).to.deep.equal([[[0.5, 0.5], [1, 0.5], [1.3, 1.3], [1.2, 1.2], [1.1, 1.1], [1, 1], [0.5, 1], [0.5, 0.5]]]);
  });

  it('Testing valid json parameter (relaxed)', () => {
    const param = api.GeoPoly('geoPolicy', 'json', { relaxed: true });
    expect(param.get({
      body: { geoPolicy: [[[1, 0], [2, 1], [1, 1], [1, 0]]] }
    })).to.deep.equal([[[1, 0], [2, 1], [1, 1], [1, 0]]]);
  });

  it('Testing invalid json parameter (maxHoles)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxHoles: 0 });
    expect(() => param.get({
      body: { geoPoly: [counterClockwisePolygon, clockwisePolygon] }
    })).to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });

  it('Testing invalid json parameter (maxPointsTotal)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsTotal: 4 });
    expect(() => param.get({
      body: { geoPoly: [counterClockwisePolygon] }
    })).to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });

  it('Testing invalid json parameter (maxPointsPerShape)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsPerShape: 4 });
    expect(() => param.get({
      body: { geoPoly: [counterClockwisePolygon] }
    })).to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });

  it('Testing invalid json parameter (maxPointsPerHole)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsPerHole: 4 });
    expect(() => param.get({
      body: { geoPoly: [counterClockwisePolygon, clockwisePolygon] }
    })).to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });

  it('Testing invalid json parameter (maxPoints)', () => {
    const param = api.GeoPoly('geoPolicy', 'json', { maxPoints: 6 });
    expect(() => param.get({
      body: { geoPolicy: [[[0.5, 0.5], [1, 0.5], [1.3, 1.3], [1.2, 1.2], [1.1, 1.1], [1, 1], [0.5, 1], [0.5, 0.5]]] }
    })).to.throw('Invalid Value for json-Parameter "geoPolicy" provided.');
  });

  it('Testing invalid json parameter (relaxed)', () => {
    const param = api.GeoPoly('geoPolicy', 'json', { relaxed: false });
    expect(() => param.get({
      body: { geoPolicy: [[[1, 0], [2, 1], [1, 1], [1, 0]]] }
    })).to.throw('Invalid Value for json-Parameter "geoPolicy" provided.');
  });

  it('Testing self intersecting geo shape', () => {
    const geoPoly = [[
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
      [-125.0180838, 49.6764755], [-125.0320134, 49.6816606], [-125.0266542, 49.6833014]]];
    expect(() => jsonParam.get({ body: { geoPoly } }))
      .to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });
});
