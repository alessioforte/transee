import { batchexecute, googleDictionary } from '@/platform';
import { Selected } from '@/types/langs';
import { isDictionaryQuery } from '@/shared/validate';
import { GoogleDictionary, parseDictionary } from './dictionary';
import {
  Mapped,
  parseSimpleTranslation,
  parseTranslation,
  toRows,
} from './parse';

/**
 *
 * Google Translate APIs
 *
 */

// Keep the raw RPC body for parse.ts, including anti-JSON prefixes and chunks.
function rpc(id: string, args: unknown): Promise<string> {
  const data = [[[id, JSON.stringify(args), null, 'generic']]];
  return batchexecute(`f.req=${encodeURI(JSON.stringify(data))}`);
}

export async function getGoogleTranslate(
  text: string,
  opts: Selected
): Promise<string> {
  const { from, to } = opts;
  return rpc('MkEWBc', [[text, from, to, true], [null]]);
}

export async function getGoogleSimpleTranslate(
  text: string,
  opts: Selected
): Promise<string> {
  const { from, to } = opts;
  return rpc('MKPkhb', [[text, from, to]]);
}

/**
 * `MkEWBc`, falling back to `MKPkhb` when its response no longer parses into
 * rows. Google reshuffles the positional `MkEWBc` layout from time to time; the
 * one-field `MKPkhb` answer keeps plain translation working until the parser
 * catches up. Transport failures propagate without a duplicate request.
 */
export async function getTranslation(
  text: string,
  opts: Selected
): Promise<Mapped> {
  const response = await getGoogleTranslate(text, opts);
  try {
    const google = parseTranslation(response);
    if (toRows(google).length > 0) return google;
    throw new Error('GetTranslation returned no rows');
  } catch (err) {
    console.warn('[transee] falling back to GetSimpleTextTranslation', err);
    return parseSimpleTranslation(await getGoogleSimpleTranslate(text, opts));
  }
}

/** Optional source-side cards; an unavailable dictionary never blocks translation. */
export async function getGoogleDictionary(
  text: string,
  opts: Selected
): Promise<GoogleDictionary | null> {
  const query = text.trim();
  if (!isDictionaryQuery(text)) return null;
  return parseDictionary(await googleDictionary(query, opts.from, opts.to), query);
}

export async function getGoogleSuggest(
  text: string,
  opts: Selected
): Promise<string> {
  const { from, to } = opts;
  return rpc('AVdN8', [text, from, to]);
}

export async function getGoogleVoice(
  text: string,
  lang: string,
  speed: boolean
): Promise<string> {
  return rpc('jQ1olc', [text, lang, speed, null]);
}

/**
 * The page Google's "Translate website" button opens. It redirects to the
 * `*.translate.goog` proxy, so the app only has to hand it to the browser.
 */
export function getWebsiteTranslationUrl(url: string, opts: Selected): string {
  const params = new URLSearchParams({
    sl: opts.from,
    tl: opts.to,
    hl: 'en',
    u: url,
    client: 'webapp',
  });
  return `https://translate.google.com/translate?${params}`;
}
