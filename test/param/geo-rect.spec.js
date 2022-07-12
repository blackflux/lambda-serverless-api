import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

describe('Testing GeoRect Parameter', () => {
  let queryParam;
  let jsonParam;
  let jsonParamRelaxed;
  before(() => {
    queryParam = api.GeoRect('geoRect', 'query');
    jsonParam = api.GeoRect('geoRect', 'json');
    jsonParamRelaxed = api.GeoRect('geoRect', 'json', { relaxed: true });
  });

  it('Testing valid query parameter', () => {
    expect(queryParam.get('[-119.491,49.892,-121.491,49.101]')).to.deep.equal([-119.491, 49.892, -121.491, 49.101]);
  });

  it('Testing invalid query parameter', () => {
    [
      '[181,0.5,0.5,0.5]', '[0.5,91,0.5,0.5]', '[0.5,0.5,181,0.5]', '[0.5,0.5,0.5,91]',
      '[-181,0.5,0.5,0.5]', '[0.5,-91,0.5,0.5]', '[0.5,0.5,-181,0.5]', '[0.5,0.5,0.5,-91]',
      '[-1', '[0.5]'
    ].forEach((geoRect) => {
      expect(() => queryParam.get(geoRect), `GeoRect: ${geoRect}`)
        .to.throw('Invalid Value for query-Parameter "geoRect" provided.');
    });
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get([-119.491, 49.892, -121.491, 49.101])).to.deep.equal([-119.491, 49.892, -121.491, 49.101]);
  });

  it('Testing invalid json parameter', () => {
    [
      [181, 0.5, 0.5, 0.5], [0.5, 91, 0.5, 0.5], [0.5, 0.5, 181, 0.5], [0.5, 0.5, 0.5, 91],
      [-181, 0.5, 0.5, 0.5], [0.5, -91, 0.5, 0.5], [0.5, 0.5, -181, 0.5], [0.5, 0.5, 0.5, -91],
      [0.5]
    ].forEach((geoRect) => {
      expect(() => jsonParam.get(geoRect), `GeoRect: ${geoRect}`)
        .to.throw('Invalid Value for json-Parameter "geoRect" provided.');
    });
  });

  it('Testing invalid json parameter (relaxed disabled)', () => {
    expect(() => jsonParam.get([-119.491, 0, -121.491, 0]))
      .to.throw('Invalid Value for json-Parameter "geoRect" provided.');
  });

  it('Testing valid json parameter (relaxed enabled)', () => {
    expect(jsonParamRelaxed.get([-119.491, 0, -121.491, 0])).to.deep.equal([-119.491, 0, -121.491, 0]);
  });
});
