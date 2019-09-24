module.exports = (name) => name
  .replace(/(?:^\w|[A-Z]|\b\w)/g, (l, idx) => (idx === 0 ? l.toLowerCase() : l.toUpperCase()))
  .replace(/[^a-zA-Z0-9]+/g, '');
