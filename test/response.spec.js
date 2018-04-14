const expect = require('chai').expect;
const response = require("../src/response");
const Api = require("../src/api");

const api = Api({});

describe("Testing Response", () => {
  it("Testing ApiError", (done) => {
    const apiError = response.ApiError();
    expect(apiError instanceof response.ApiErrorClass).to.equal(true);
    done();
  });

  it("Testing ApiResponse Integration", (done) => {
    api.wrap("GET test", [], 10, (event, context, rb) => rb.warning("123")
      .then(() => api.ApiResponse("promiseResponse")))({
      httpMethod: "GET"
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({ statusCode: 200, body: 'promiseResponse', headers: {} });
      done();
    });
  });

  it("Testing ApiError Integration", (done) => {
    api.wrap("GET test", [], 10, (event, context, rb) => rb.warning("123").then(() => {
      throw api.ApiError("promiseError");
    }))({
      httpMethod: "GET"
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(null);
      expect(resp).to.deep.equal({ statusCode: 400, body: '{"message":"promiseError"}' });
      done();
    });
  });


  it("Testing Error Integration", (done) => {
    const error = new Error("other");
    api.wrap("GET test", [], 10, (event, context, rb) => rb.warning("123").then(() => {
      throw error;
    }))({
      httpMethod: "GET"
    }, {
      getRemainingTimeInMillis: () => 0
    }, (err, resp) => {
      expect(err).to.equal(error);
      expect(resp).to.equal(undefined);
      done();
    });
  });
});
