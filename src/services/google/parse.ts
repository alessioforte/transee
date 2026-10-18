import { GoogleDictionary } from './dictionary';

/**
 * Decoding of Google's `batchexecute` responses.
 *
 * These positional array walks used to live inside the zustand store's IPC
 * listener, which made them impossible to test without a running shell. They
 * are pure functions now; `src/tests/parser.test.ts` exercises them against
 * recorded responses in `fixtures/`.
 */

/** Supports both plain responses and the browser's length-prefixed chunks. */
export function parse(data: string, rpcId?: string): any {
  const body = data.replace(/^\)\]\}'\r?\n?/, '').trim();
  let chunks: unknown[];
  try {
    chunks = [JSON.parse(body)];
  } catch {
    chunks = body.split(/\r?\n/).filter((line) => line.trim().startsWith('['))
      .map((line) => JSON.parse(line));
  }
  for (const chunk of chunks) {
    if (!Array.isArray(chunk)) continue;
    const frame = chunk.find((entry: unknown) =>
      Array.isArray(entry) && entry[0] === 'wrb.fr' &&
      (!rpcId || entry[1] === rpcId) && typeof entry[2] === 'string'
    );
    if (frame) return JSON.parse(frame[2]);
  }
  throw new Error(`Missing Google RPC payload${rpcId ? ` for ${rpcId}` : ''}`);
}

export type Mapped = {
  pronunciation: any;
  correction: any;
  translation: any;
  input: any;
  /** The language Google translated from: the detected one when `sl` is `auto`. */
  source: string | null;
  definitions: any;
  examples: any;
  seeAlso: any;
  synonyms: any;
  translations: any;
  dictionary?: GoogleDictionary;
};

// TODO improve mapping — the indices are Google's, not ours.
export function map(arr: any[]): Mapped {
  return {
    // `arr[0]` is null when the input is a web address: Google then answers
    // with the address itself plus its website-translation link.
    pronunciation: arr[0]?.[0],
    correction: arr[0]?.[1],
    translation: arr[1][0],
    input: arr[1][4],
    source: arr[2] ?? arr[1][3] ?? null,
    definitions: arr[3] && arr[3][1] && arr[3][1][0], // verb, noun, adjective
    examples: arr[3] && arr[3][2] && arr[3][2][0].map((item: any) => item[1]),
    seeAlso: arr[3] && arr[3][3] && arr[3][3][0],
    synonyms: arr[3] && arr[3][4] && arr[3][4][0], // verb, noun, adjective
    translations: arr[3] && arr[3][5] && arr[3][5][0], // verb, noun, adjective
  };
}

/** The text to re-translate when the user inverts languages. */
export function pickPayload(google: Mapped): string | null {
  if (google.translation[1] && google.translation[1][0]) {
    return google.translation[1][0];
  }
  if (google.translation[0][5] && google.translation[0][5][0][0]) {
    return google.translation[0][5][0][0];
  }
  if (typeof google.translation[0][0] === 'string' && google.translation[0][0]) {
    return google.translation[0][0];
  }
  return null;
}

export function parseSuggestions(response: string): [string, string][] {
  const hints = parse(response, 'AVdN8');
  return (hints && hints[0]) || [];
}

export function parseTranslation(response: string): Mapped {
  return map(parse(response, 'MkEWBc'));
}

/**
 * `GetSimpleTextTranslation` (`MKPkhb`) answers `[translation]` and nothing
 * else. It is only the fallback for when the `MkEWBc` layout stops parsing, so
 * it is shaped into a `Mapped` with a single row and no dictionary data.
 */
export function parseSimpleTranslation(response: string): Mapped {
  const data = parse(response, 'MKPkhb');
  if (!Array.isArray(data) || typeof data[0] !== 'string') {
    throw new Error('Unexpected GetSimpleTextTranslation response');
  }
  return {
    pronunciation: null,
    correction: null,
    translation: [[data[0]]],
    input: null,
    source: null,
    definitions: null,
    examples: null,
    seeAlso: null,
    synonyms: null,
    translations: null,
  };
}

/** Google returns the audio as base64 inside the usual positional wrapper. */
export function parseVoice(response: string): Uint8Array {
  const data = parse(response, 'jQ1olc');
  const voice = decodeURI(data[0]);
  return Uint8Array.from(window.atob(voice), (c) => c.charCodeAt(0));
}

/**
 * Flattens the translation into the rows the UI renders.
 *
 * Google splits gendered results (`translation[0][5]`) into separate sentence
 * fragments; those get joined back into one line. This was inlined in the App
 * component behind a `// TODO move this code in mapping`.
 */
export function toRows(google: Mapped | null): any[] {
  if (!google) return [];
  const translation = google.translation;
  if (Array.isArray(translation[0][5])) {
    const sentence = translation[0][5]
      .map((t: any) => t[0])
      .join(' ')
      .concat(' ');
    return [[sentence]];
  }
  if (translation[0][0] || translation[0][1]) return translation;
  return [];
}
