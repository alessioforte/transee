/**
 * Gates whether a query is worth asking Google for *suggestions*. Translation
 * requests are not filtered by this.
 */
export const validateInput = (text: string): boolean => {
  const isUppercase = /[A-Z]/.test(text);
  const hasDoubleSpace = /\s\s+/.test(text);
  const hasSpaceAtFirst = Boolean(text) && text.charAt(0) === ' ';
  const isNewLine = /\n/g.test(text);
  return !(!text || isUppercase || hasDoubleSpace || hasSpaceAtFirst || isNewLine);
};
