const expect = require('chai').expect;
const Find = require("./../../src/util/find");

const haystack = { some: { path: "a" }, other: { path: "a" }, something: { else: ["a", "b", "c"] } };

describe("Testing Find", () => {
  it("Testing Simple", () => {
    const find = Find(["some.path"]);
    expect(find(haystack)).to.deep.equal([
      "some.path"
    ]);
  });

  it("Testing Star", () => {
    const find = Find(["*.path"]);
    expect(find(haystack)).to.deep.equal([
      "some.path",
      "other.path"
    ]);
  });

  it("Testing Array", () => {
    const find = Find(["something.else.*"]);
    expect(find(haystack)).to.deep.equal([
      "something.else.0",
      "something.else.1",
      "something.else.2"
    ]);
  });
});
