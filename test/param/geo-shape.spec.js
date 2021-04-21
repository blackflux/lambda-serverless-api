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
      [-125.01808, 49.67647], [-125.03201, 49.68166], [-125.02665, 49.68330]];
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
