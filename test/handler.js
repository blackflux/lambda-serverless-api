const api = require("./../lib/api")();

module.exports.json = api.wrap(process.env.RATE_LIMIT, () => new api.JsonResponse({ some: "json" }));

module.exports.error = api.wrap(process.env.RATE_LIMIT, () => {
  throw new api.ApiError("Some Error");
});

module.exports.exception = api.wrap(process.env.RATE_LIMIT, () => {
  throw new Error("Some Exception");
});
