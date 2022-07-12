import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing GeoPolyList Parameter', () => {
  let queryParam;
  let jsonParam;
  let clockwisePolygon;
  let counterClockwisePolygon;
  let polygonValid;
  let polygonInvalid;

  before(() => {
    queryParam = api.GeoPolyList('geoPolyList', 'query');
    jsonParam = api.GeoPolyList('geoPolyList', 'json');
    clockwisePolygon = [[0.5, 0.5], [0.5, 1], [1, 1], [1, 0.5], [0.5, 0.5]];
    counterClockwisePolygon = [[0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1], [0.5, 0.5]];
    polygonValid = [counterClockwisePolygon, clockwisePolygon];
    polygonInvalid = [clockwisePolygon, counterClockwisePolygon];
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get(JSON.stringify([polygonValid]))).to.deep.equal([polygonValid]);
  });

  it('Testing valid json parameter with only perimeter', () => {
    expect(jsonParam.get([polygonValid])).to.deep.equal([polygonValid]);
  });

  it('Testing invalid query parameter', () => {
    expect(() => queryParam.get(JSON.stringify([polygonInvalid]))).to.throw('Invalid Value for query-Parameter "geoPolyList" provided.');
  });

  it('Testing invalid json parameter', () => {
    expect(() => jsonParam.get([polygonInvalid])).to.throw('Invalid Value for json-Parameter "geoPolyList" provided.');
  });

  it('Testing invalid json parameter (maxHoles)', () => {
    const param = api.GeoPolyList('geoPolyList', 'json', { maxHoles: 0 });
    expect(() => param.get([polygonValid])).to.throw('Invalid Value for json-Parameter "geoPolyList" provided.');
  });

  it('Testing invalid json parameter (maxPointsPerimeter)', () => {
    const param = api.GeoPolyList('geoPolyList', 'json', { maxPointsPerimeter: 4 });
    expect(() => param.get([polygonValid])).to.throw('Invalid Value for json-Parameter "geoPolyList" provided.');
  });

  it('Testing invalid json parameter (maxPointsPerHole)', () => {
    const param = api.GeoPolyList('geoPolyList', 'json', { maxPointsPerHole: 4 });
    expect(() => param.get([polygonValid])).to.throw('Invalid Value for json-Parameter "geoPolyList" provided.');
  });

  it('Testing invalid json parameter (maxPoints)', () => {
    const param = api.GeoPolyList('geoPolyList', 'json', { maxPoints: 7 });
    expect(() => param.get({
      body: {
        geoPolyList: [
          [[[0.5, 0.5], [1, 0.5], [1.3, 1.3], [1.2, 1.2], [1.1, 1.1], [1, 1], [0.5, 1], [0.5, 0.5]]]
        ]
      }
    })).to.throw('Invalid Value for json-Parameter "geoPolyList" provided.');
  });
});
