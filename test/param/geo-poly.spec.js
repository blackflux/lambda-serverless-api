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
        geoPoly: JSON.stringify([counterClockwisePolygon])
      }
    })).to.deep.equal([counterClockwisePolygon]);
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

  it('Testing valid json parameter (maxPointsPerimeter)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsPerimeter: 5 });
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

  it('Testing invalid json parameter (maxPointsPerimeter)', () => {
    const param = api.GeoPoly('geoPoly', 'json', { maxPointsPerimeter: 4 });
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

  it('Testing self intersecting geo poly', () => {
    const geoPoly = [[
      [-125.02665, 49.68330], [-125.02702, 49.68737], [-125.00338, 49.69274], [-124.99928, 49.69950],
      [-124.99197, 49.69748], [-124.99724, 49.70416], [-125.01264, 49.70729], [-124.99554, 49.71648],
      [-125.00685, 49.72176], [-125.00002, 49.72513], [-124.99018, 49.71610], [-124.97093, 49.72814],
      [-124.97807, 49.73354], [-124.96612, 49.74071], [-124.95539, 49.74053], [-124.95553, 49.73699],
      [-124.93320, 49.73907], [-124.93329, 49.73372], [-124.94414, 49.73379], [-124.94425, 49.73012],
      [-124.93343, 49.72995], [-124.93409, 49.70924], [-124.94533, 49.70590], [-124.94398, 49.69333],
      [-124.96386, 49.68797], [-124.97279, 49.69543], [-124.98877, 49.68685], [-124.97838, 49.68436],
      [-124.98207, 49.68220], [-124.95914, 49.65919], [-124.96453, 49.65649], [-124.95762, 49.65074],
      [-124.96247, 49.65261], [-124.96283, 49.64753], [-124.95807, 49.64700], [-124.98095, 49.64979],
      [-124.98112, 49.65410], [-124.99351, 49.65705], [-125.00529, 49.66652], [-125.01194, 49.66069],
      [-125.01898, 49.66615], [-125.01141, 49.67133], [-125.01785, 49.67627], [-125.02721, 49.67123],
      [-125.01808, 49.67647], [-125.03201, 49.68166], [-125.02665, 49.68330]]];
    expect(() => jsonParam.get({ body: { geoPoly } }))
      .to.throw('Invalid Value for json-Parameter "geoPoly" provided.');
  });
});
