import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { parseDictionary } from '@/services/google/dictionary';
import DictionaryCards from '@/features/translation/StickyCards/DictionaryCards';

const fixture = readFileSync(join(__dirname, '../../fixtures/dictionary-run.json'), 'utf8');

describe('structured Google dictionary', () => {
  it('maps translations, definitions, linked synonyms, labels, and examples', () => {
    const dictionary = parseDictionary(fixture, 'run')!;
    expect(dictionary.headword).toBe('run');
    expect(dictionary.translations[0].entries[1]).toEqual({
      text: 'correre', reverseTranslations: ['run', 'race', 'rush', 'take part in', 'go round', 'scud'],
    });
    expect(dictionary.definitions[0].entries[0]).toMatchObject({
      example: 'the dog ran across the road', synonyms: ['tear', 'pelt', 'sprint', 'race'],
    });
    expect(dictionary.synonyms[0].entries[0].labels).toEqual(['informal']);
    expect(dictionary.examples).toEqual(['I run every morning', 'the tape has run out']);
  });

  it('returns no cards when Google only supplies a translation or optional fields are malformed', () => {
    expect(parseDictionary('{"sentences":[{"trans":"ciao"}]}', 'hello')).toBeNull();
    expect(parseDictionary('{"dict":[null,{"entry":"not a list"}],"synsets":null,"examples":[]}', 'run')).toBeNull();
    expect(() => parseDictionary('<html>offline</html>', 'run')).toThrow();
  });

  it('falls back to terms and safely converts markup/entities to text', () => {
    const dictionary = parseDictionary(JSON.stringify({
      dict: [{ terms: ['ciao', 'ciao', null] }],
      examples: { example: [{ text: '<b>Hello</b> &amp; &#x1f44b; <img src=x onerror=alert(1)>' }] },
    }), 'hello')!;
    expect(dictionary.translations[0].entries).toEqual([{ text: 'ciao', reverseTranslations: [] }]);
    expect(dictionary.examples).toEqual(['Hello & 👋']);
  });

  it('renders all card sections without inserting external HTML', () => {
    const dictionary = parseDictionary(fixture, 'run')!;
    dictionary.examples.push('<img src=x onerror=alert(1)>');
    const html = renderToStaticMarkup(createElement(DictionaryCards, { dictionary, onClick: () => undefined }));
    for (const section of ['TRANSLATIONS', 'DEFINITIONS', 'SYNONYMS', 'EXAMPLES']) expect(html).toContain(section);
    expect(html).toContain('correre');
    expect(html).toContain('I run every morning');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});
