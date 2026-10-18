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

/**
 * Whether the whole input is one public http(s) address — what Google's
 * website translation accepts. Bare domains are left alone: "example.com" is
 * as likely to be text the user wants translated.
 */
export const isWebUrl = (text: string): boolean => {
  const value = text.trim();
  if (!value || /\s/.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    url.hostname.includes('.') &&
    !url.username &&
    !url.password
  );
};
