import { expect } from 'chai';
import { describe } from 'node-tdd';
import { Api } from '../../src/index.js';

const api = Api();

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
    expect(queryParam.get('[-119.491,49.892]')).to.deep.equal([-119.491, 49.892]);
  });

  it('Testing invalid query parameter', () => {
    ['[-181,0.5]', '[181,0.5]', '[0.5,-91]', '[0.5,91]', '[0.5,0.5,0.5]'].forEach((geoPoint) => {
      expect(() => queryParam.get(geoPoint), `GeoPoint: ${geoPoint}`)
        .to.throw('Invalid Value for query-Parameter "geoPoint" provided.');
    });
  });

  it('Testing valid json parameter', () => {
    expect(jsonParam.get([-119.491, 49.892])).to.deep.equal([-119.491, 49.892]);
  });

  it('Testing invalid json parameter', () => {
    [[-181, 0.5], [181, 0.5], [0.5, -91], [0.5, 91], [0.5, 0.5, 0.5], '0.5,0'].forEach((geoPoint) => {
      expect(() => jsonParam.get(geoPoint), `GeoPoint: ${geoPoint}`)
        .to.throw('Invalid Value for json-Parameter "geoPoint" provided.');
    });
  });

  it('Testing invalid json parameter (relaxed disabled)', () => {
    expect(() => jsonParam.get([0, 0]))
      .to.throw('Invalid Value for json-Parameter "geoPoint" provided.');
  });

  it('Testing valid json parameter (relaxed enabled)', () => {
    expect(jsonParamRelaxed.get([0, 0])).to.deep.equal([0, 0]);
  });
});
