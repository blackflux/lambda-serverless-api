const logging = (type, msg) => {
  // eslint-disable-next-line no-console
  console.log(`${type.toUpperCase()}: ${msg}`);
};

module.exports = ['debug', 'info', 'warning', 'error', 'critical'].reduce((p, c) => Object.assign(p, {
  [c]: (...msgs) => msgs.forEach(m => logging(c, m))
}), {});
