/**
 * Decoding of Google's `batchexecute` responses.
 *
 * These positional array walks used to live inside the zustand store's IPC
 * listener, which made them impossible to test without a running shell. They
 * are pure functions now; `src/tests/parser.test.ts` exercises them against
 * recorded responses in `fixtures/`.
 */

/** Strips the `)]}'` anti-JSON prefix and unwraps the doubly-encoded payload. */
export function parse(data: string): any {
  const sliced = data.slice(5);
  let parsedURI = sliced;
  try {
    parsedURI = decodeURI(sliced);
  } catch {
    // Some responses contain stray `%` sequences that are not valid escapes.
    parsedURI = sliced;
  }
  const parsed = JSON.parse(parsedURI);
  return JSON.parse(parsed[0][2]);
}

export type Mapped = {
  pronunciation: any;
  correction: any;
  translation: any;
  input: any;
  definitions: any;
  examples: any;
  seeAlso: any;
  synonyms: any;
  translations: any;
};

// TODO improve mapping — the indices are Google's, not ours.
export function map(arr: any[]): Mapped {
  return {
    pronunciation: arr[0][0],
    correction: arr[0][1] && arr[0][1],
    translation: arr[1][0],
    input: arr[1][4],
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
  return null;
}

export function parseSuggestions(response: string): [string, string][] {
  const hints = parse(response);
  return (hints && hints[0]) || [];
}

export function parseTranslation(response: string): Mapped {
  return map(parse(response));
}

/** Google returns the audio as base64 inside the usual positional wrapper. */
export function parseVoice(response: string): Uint8Array {
  const data = parse(response);
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
