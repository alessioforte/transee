export type Langs = {
  from: string;
  to: string;
};

export type Hint = {
  key: number | string;
  value: string;
  label?: string;
};

export type TranslationData = {
  correction: any;
  input: string[];
  pronunciation: string;
  target: string;
  text: string;
  translation: string;
  examples: string[];
  synonyms: any;
  definitions: any;
  translations: any;
  seeAlso?: any;
};
