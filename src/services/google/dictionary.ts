export type DictionaryTranslation = {
  text: string;
  reverseTranslations: string[];
};

export type DictionaryDefinition = {
  text: string;
  example?: string;
  synonyms: string[];
};

export type DictionarySynonyms = {
  words: string[];
  labels: string[];
};

export type DictionaryGroup<T> = {
  partOfSpeech: string;
  entries: T[];
};

export type GoogleDictionary = {
  headword: string;
  translations: DictionaryGroup<DictionaryTranslation>[];
  definitions: DictionaryGroup<DictionaryDefinition>[];
  synonyms: DictionaryGroup<DictionarySynonyms>[];
  examples: string[];
};

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

/** External markup is converted to text, never inserted into the document. */
function text(value: unknown): string {
  if (typeof value !== 'string') return '';
  const entities: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  };
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code: string) => {
      if (!code.startsWith('#')) return entities[code.toLowerCase()] ?? entity;
      const point = code.toLowerCase().startsWith('#x')
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/[\u200b\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const words = (value: unknown): string[] =>
  [...new Set(list(value).map(text).filter(Boolean))];

/** Parses Google's structured translate_a/single response, not an RPC frame. */
export function parseDictionary(response: string, query: string): GoogleDictionary | null {
  const data = record(JSON.parse(response));
  const synonymsByDefinition = new Map<string, string[]>();
  const synonyms: GoogleDictionary['synonyms'] = [];

  for (const value of list(data.synsets)) {
    const group = record(value);
    const entries: DictionarySynonyms[] = [];
    for (const value of list(group.entry)) {
      const entry = record(value);
      const found = words(entry.synonym);
      if (!found.length) continue;
      const id = text(entry.definition_id);
      if (id) synonymsByDefinition.set(id, [
        ...new Set([...(synonymsByDefinition.get(id) ?? []), ...found]),
      ]);
      entries.push({ words: found, labels: words(record(entry.label_info).register) });
    }
    if (entries.length) synonyms.push({ partOfSpeech: text(group.pos), entries });
  }

  const definitions: GoogleDictionary['definitions'] = [];
  for (const value of list(data.definitions)) {
    const group = record(value);
    const entries: DictionaryDefinition[] = [];
    for (const value of list(group.entry)) {
      const entry = record(value);
      const definition = text(entry.gloss);
      if (!definition) continue;
      entries.push({
        text: definition,
        example: text(entry.example) || undefined,
        synonyms: synonymsByDefinition.get(text(entry.definition_id)) ?? [],
      });
    }
    if (entries.length) definitions.push({ partOfSpeech: text(group.pos), entries });
  }

  const translations: GoogleDictionary['translations'] = [];
  for (const value of list(data.dict)) {
    const group = record(value);
    const entries: DictionaryTranslation[] = [];
    for (const value of list(group.entry)) {
      const entry = record(value);
      const translation = text(entry.word);
      if (translation) entries.push({ text: translation, reverseTranslations: words(entry.reverse_translation) });
    }
    if (!entries.length) entries.push(...words(group.terms).map((term) => ({
      text: term, reverseTranslations: [],
    })));
    if (entries.length) translations.push({ partOfSpeech: text(group.pos), entries });
  }

  const examples = [...new Set(list(record(data.examples).example)
    .map((entry) => text(record(entry).text)).filter(Boolean))];
  if (!translations.length && !definitions.length && !synonyms.length && !examples.length) return null;

  const firstGroup = record(list(data.definitions)[0] ?? list(data.synsets)[0] ?? list(data.dict)[0]);
  return {
    headword: text(firstGroup.base_form) || query.trim(),
    translations, definitions, synonyms, examples,
  };
}
