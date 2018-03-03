const api = require("./../lib/api");

module.exports.json = api.wrap(process.env.RATE_LIMIT_MAX, () => new api.JsonResponse({ some: "json" }));

module.exports.error = api.wrap(process.env.RATE_LIMIT_MAX, () => {
  throw new api.ApiError("Some Error");
});

module.exports.exception = api.wrap(process.env.RATE_LIMIT_MAX, () => {
  throw new Error("Some Exception");
});
