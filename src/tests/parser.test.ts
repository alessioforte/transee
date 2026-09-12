import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import mapping from '@/utils/mapping';

// Mirror of the (unexported) parser in src/renderer/store/index.tsx:149-159.
// When the parser moves into services/google in the refactor, import it here
// instead — this copy exists only to pin behaviour before the migration.
const parser = (data: string) => {
  const sliced = data.slice(5);
  let parsedURI = sliced;
  try {
    parsedURI = decodeURI(sliced);
  } catch (err) {
    parsedURI = sliced;
  }
  const parsed = JSON.parse(parsedURI);
  return JSON.parse(parsed[0][2]);
};

// Mirror of the payload heuristic in src/renderer/store/index.tsx:177-186.
const pickPayload = (google: ReturnType<typeof mapping>): string | null => {
  let payload: null | string = null;
  if (google.translation[1] && google.translation[1][0]) {
    payload = google.translation[1][0];
  } else if (google.translation[0][5] && google.translation[0][5][0][0]) {
    payload = google.translation[0][5][0][0];
  }
  return payload;
};

const fixture = (name: string) =>
  readFileSync(join(__dirname, '../../fixtures', name), 'utf8');

describe('batchexecute parser (fixtures captured from the live endpoint)', () => {
  it('parses a translation response', () => {
    const arr = parser(fixture('translation.txt'));
    expect(arr[0][6]).toEqual(['hello world', 'en', 'it', true]);
    expect(arr[1][0][0][5][0][0]).toBe('Ciao mondo');
  });

  it('parses a hints response into suggestion tuples', () => {
    const hints = parser(fixture('hints.txt'));
    const suggestions = hints && hints[0];
    expect(suggestions[0]).toEqual(['hello', 'Ciao']);
    expect(suggestions.length).toBeGreaterThan(1);
  });

  it('parses a voice response into a base64 audio payload', () => {
    const data = parser(fixture('voice.txt'));
    const voice = decodeURI(data[0]);
    // atob must succeed on the (decodeURI'd) payload — this is what the
    // renderer feeds to AudioContext.
    expect(() => atob(voice)).not.toThrow();
    expect(atob(voice).length).toBeGreaterThan(1000);
  });
});

describe('mapping + payload heuristic end to end', () => {
  it('extracts the translated text from a real response', () => {
    const google = mapping(parser(fixture('translation.txt')));
    expect(google.input).toEqual(['hello world', 'en', 'it', true]);
    expect(pickPayload(google)).toBe('Ciao mondo');
  });

  it('extracts the translated text from a single-word response', () => {
    const google = mapping(parser(fixture('translation-rich.txt')));
    expect(pickPayload(google)).toBe('Ciao');
  });
});

describe('mapping on a dictionary-bearing response shape', () => {
  // Synthetic arr exercising the arr[3] branches (definitions, examples,
  // seeAlso, synonyms, translations) that mapping indexes positionally.
  const arr: any[] = [
    ['pron', 'correction?'],
    [[['x', null, null, null, null, [['Ciao']]]], 'it', 1, 'en', 'hello'],
    null,
    [
      null,
      [['DEFS']],
      [[['ex-meta', 'example sentence']]],
      [['SEE-ALSO']],
      [['SYNS']],
      [['TRANSLATIONS']],
    ],
  ];

  it('maps every positional section', () => {
    const data = mapping(arr);
    expect(data.pronunciation).toBe('pron');
    expect(data.correction).toBe('correction?');
    expect(data.translation).toEqual(arr[1][0]);
    expect(data.input).toBe('hello');
    expect(data.definitions).toEqual(['DEFS']);
    expect(data.examples).toEqual(['example sentence']);
    expect(data.seeAlso).toEqual(['SEE-ALSO']);
    expect(data.synonyms).toEqual(['SYNS']);
    expect(data.translations).toEqual(['TRANSLATIONS']);
  });

  it('leaves dictionary fields undefined when arr[3] is null', () => {
    const data = mapping(parser(fixture('translation.txt')));
    expect(data.definitions).toBeFalsy();
    expect(data.examples).toBeFalsy();
    expect(data.synonyms).toBeFalsy();
  });
});
