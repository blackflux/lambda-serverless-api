const api = require("./../lib/api")();

module.exports.error = api.wrap("GET error", [], process.env.RATE_LIMIT, () => {
  throw api.ApiError("Some Error", 400, 2341);
});

module.exports.exception = api.wrap("GET exception", [], process.env.RATE_LIMIT, () => {
  throw Error("Some Exception");
});

module.exports.text = api.wrap("GET text", [], process.env.RATE_LIMIT, () => api.ApiResponse("some text"));

module.exports.json = api.wrap("GET json", [], process.env.RATE_LIMIT, () => api.JsonResponse({ some: "json" }));

module.exports.param = api.wrap("POST param", [
  api.Str("username", "json"),
  api.Email("email", "json", false),
  api.Str("ref", "query", false),
  api.RegEx("notification", "^(1|0)$", "query", false),
  api.Str("authorizer", "context", false),
  api.Str("authorizer", "header", false)
], process.env.RATE_LIMIT, params => api.JsonResponse(params));

module.exports.internalApi = api;
