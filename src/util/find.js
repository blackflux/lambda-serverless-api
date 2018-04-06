module.exports = (needles) => {
  const compiledSearch = needles.map(n => new RegExp(`^${n.replace(/\./g, "\\.").replace(/\*/g, "[^.]+?")}$`));

  const find = (haystack, hierarchy = []) => {
    const result = [];
    const selector = hierarchy.join(".");
    if (compiledSearch.some(search => selector.match(search))) {
      result.push(selector);
    }
    if (haystack instanceof Object) {
      if (Array.isArray(haystack)) {
        for (let i = 0; i < haystack.length; i += 1) {
          result.push(...find(haystack[i], hierarchy.concat([i])));
        }
      } else {
        Object.keys(haystack).forEach((key) => {
          result.push(...find(haystack[key], hierarchy.concat([key])));
        });
      }
    }
    return result;
  };

  return find;
};
