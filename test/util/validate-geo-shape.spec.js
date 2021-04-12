const fs = require('smart-fs');
const expect = require('chai').expect;
const { describe } = require('node-tdd');
const validate = require('../../src/util/validate-geo-shape');

describe('Testing validate-geo-shape.js', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  fs.walkDir(`${__filename}__fixtures`).forEach((f) => {
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
