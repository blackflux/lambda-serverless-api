import fs from 'smart-fs';
import { expect } from 'chai';
import { describe } from 'node-tdd';
import validate from '../../src/util/validate-geo-shape.js';

describe('Testing validate-geo-shape.js', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  fs.walkDir(`${fs.filename(import.meta.url)}__fixtures`).forEach((f) => {
    it(`Testing polygon ${f}`, ({ fixture }) => {
      const data = fixture(f);
      data.geometry.coordinates.forEach((poly) => {
        expect(validate({
          geoShape: poly[0],
          clockwise: false,
          relaxed: false
        })).to.equal(true);
      });
    });
  });
});
