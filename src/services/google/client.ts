import { batchexecute } from '@/platform';
import { Selected } from '@/types/langs';

/**
 *
 * Google Translate APIs
 *
 */

// Each call resolves with the raw `batchexecute` body, `)]}'`-prefix and all —
// the parser in the store is unchanged from the Electron build.
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
