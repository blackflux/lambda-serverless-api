const expect = require('chai').expect;
const response = require("../src/response");

describe("Testing Response", () => {
  it("Testing ApiError", (done) => {
    const apiError = response.ApiError();
    expect(apiError instanceof response.ApiErrorClass).to.equal(true);
    done();
  });
});
