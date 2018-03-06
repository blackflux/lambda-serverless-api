const api = require("./../lib/api")();

module.exports.text = api.wrap(process.env.RATE_LIMIT, () => api.ApiResponse("some text"));

module.exports.json = api.wrap(process.env.RATE_LIMIT, () => api.JsonResponse({ some: "json" }));

module.exports.error = api.wrap(process.env.RATE_LIMIT, () => {
  throw api.ApiError("Some Error", 400, 2341);
});

module.exports.exception = api.wrap(process.env.RATE_LIMIT, () => {
  throw Error("Some Exception");
});
