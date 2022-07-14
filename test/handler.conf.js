export const stripHeaders = true;
export const modifiers = {
  base64: (str) => Buffer.from(str).toString('base64')
};
