import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  parse,
  map,
  pickPayload,
  parseSuggestions,
  parseTranslation,
  toRows,
} from '@/services/google/parse';

const fixture = (name: string) =>
  readFileSync(join(__dirname, '../../fixtures', name), 'utf8');

describe('batchexecute parser (fixtures captured from the live endpoint)', () => {
  it('parses a translation response', () => {
    const arr = parse(fixture('translation.txt'));
    expect(arr[0][6]).toEqual(['hello world', 'en', 'it', true]);
    expect(arr[1][0][0][5][0][0]).toBe('Ciao mondo');
  });

  it('parses a hints response into suggestion tuples', () => {
    const suggestions = parseSuggestions(fixture('hints.txt'));
    expect(suggestions[0]).toEqual(['hello', 'Ciao']);
    expect(suggestions.length).toBeGreaterThan(1);
  });

  it('parses a voice response into decodable base64', () => {
    const data = parse(fixture('voice.txt'));
    const voice = decodeURI(data[0]);
    expect(() => atob(voice)).not.toThrow();
    expect(atob(voice).length).toBeGreaterThan(1000);
  });
});

describe('mapping + payload heuristic end to end', () => {
  it('extracts the translated text from a real response', () => {
    const google = parseTranslation(fixture('translation.txt'));
    expect(google.input).toEqual(['hello world', 'en', 'it', true]);
    expect(pickPayload(google)).toBe('Ciao mondo');
  });

  it('extracts the translated text from a single-word response', () => {
    const google = parseTranslation(fixture('translation-rich.txt'));
    expect(pickPayload(google)).toBe('Ciao');
  });
});

describe('toRows', () => {
  it('joins gendered fragments into one line', () => {
    const google = parseTranslation(fixture('translation.txt'));
    const rows = toRows(google);
    expect(rows).toHaveLength(1);
    expect(rows[0][0]).toBe('Ciao mondo ');
  });

  it('returns nothing when there is no translation', () => {
    expect(toRows(null)).toEqual([]);
  });
});

describe('map on a dictionary-bearing response shape', () => {
  // Synthetic arr exercising the arr[3] branches (definitions, examples,
  // seeAlso, synonyms, translations) that `map` indexes positionally.
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
    const data = map(arr);
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
    const data = parseTranslation(fixture('translation.txt'));
    expect(data.definitions).toBeFalsy();
    expect(data.examples).toBeFalsy();
    expect(data.synonyms).toBeFalsy();
  });
});
