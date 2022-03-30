export default (obj) => Object.entries(obj)
  .reduce((p, [h, v]) => Object.assign(p, { [h.toLowerCase()]: v }), {});
