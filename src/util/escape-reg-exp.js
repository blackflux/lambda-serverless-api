export default (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
