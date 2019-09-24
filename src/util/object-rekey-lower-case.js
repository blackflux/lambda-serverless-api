module.exports = (obj) => Object.entries(obj)
  .reduce((p, [h, v]) => Object.assign(p, { [h.toLowerCase()]: v }), {});
