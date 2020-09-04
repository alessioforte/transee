/* eslint-disable */
import { Langs, Hint, TranslationData } from './interfaces';
import {
  complete,
  translateComplete,
  translate,
  voice,
  reversoTranslation,
  reversoSuggest,
} from './api';
import { reversoLangsConversion } from './langs';

export const getHints = async (
  value: string,
  langs: Langs
): Promise<Hint[]> => {
  try {
    const { data } = await complete(value, langs.from);
    const hints = remapComplete(data);
    const slice = hints?.slice(0, 4);
    const tHints = await translateComplete(slice, langs);
    const tips = Array.isArray(tHints.data) ? tHints.data : [tHints.data];

    return slice?.map((hint, i) => ({
      key: i,
      value: hint,
      label: tips[i],
    }));
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getTranslation = async (
  value: string,
  langs: Langs
): Promise<TranslationData | null> => {
  try {
    const { data } = await translate(value, langs);
    return remapTranslate(data);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const playAudio = async (
  text: string,
  lang: string,
  speed: boolean = false
): Promise<void> => {
  try {
    const response = await voice(text, lang, speed);
    const audio = new Audio(response);
    audio.play();
  } catch (error) {
    console.error(error);
  }
};

export const getReversoTranslation = async (
  value: string,
  langs: Langs
): Promise<any | null> => {
  try {
    const from = reversoLangsConversion[langs.from];
    const to = reversoLangsConversion[langs.to];
    if (!from || !to) return null;
    const { data } = await reversoTranslation(value, { from, to });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getReversoSuggest = async (
  value: string,
  langs: Langs
): Promise<any | null> => {
  try {
    const { data } = await reversoSuggest(value, langs);
    return data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Mapping ---------------------------------------------------------------------
 */
function remapTranslate(data): TranslationData {
  const obj = {
    correction: {
      language: {
        didYouMean: false,
        iso: '',
      },
      text: {
        autoCorrected: false,
        value: '',
        didYouMean: false,
      },
    },
  };

  if (data[2] === data[8][0][0]) {
    obj.correction.language.iso = data[2];
  } else {
    obj.correction.language.didYouMean = true;
    obj.correction.language.iso = data[8][0][0];
  }

  if (data[7] && data[7][0]) {
    const youMean = data[7][1];
    obj.correction.text.value = youMean;

    if (data[7][5] === true) {
      obj.correction.text.autoCorrected = true;
    } else {
      obj.correction.text.didYouMean = true;
    }
  }

  if (data[0]) {
    let length = data[0].length;
    let input = [];
    let translation = [];
    obj.target = data[0][0][1] || null;

    for (let i = 0; i < length; i++) {
      if (data[0][i][1] !== null) {
        input.push(data[0][i][1]);
        translation.push(data[0][i][0]);
      }
    }
    obj.input = input;
    obj.text = input.join('');
    obj.translation = translation.join('');
  }

  if (data[0] && data[0][1]) {
    obj.pronunciation = data[0][1][3];
  }

  if (data[1]) {
    let translations = [];

    for (let i = 0; i < data[1].length; i++) {
      let type = data[1][i][0];
      let content = [];

      for (let j = 0; j < data[1][i][2].length; j++) {
        let rating = data[1][i][2][j][3];
        let bar;

        switch (true) {
          case rating > 0.05:
            bar = 'common';
            break;
          case rating < 0.05 && rating > 0.002:
            bar = 'uncommon';
            break;
          case rating < 0.002:
            bar = 'rare';
            break;
          case rating === undefined:
            bar = 'rare';
        }

        let obj = {
          article: data[1][i][2][j][4] || null,
          word: data[1][i][2][j][0],
          meaning: data[1][i][2][j][1],
          rating,
          bar,
        };

        content.push(obj);
      }

      let section = {
        type,
        content,
      };

      translations.push(section);
    }

    obj.translations = translations;
  }

  if (data[12]) {
    let definitions = [];

    for (let i = 0; i < data[12].length; i++) {
      let type = data[12][i][0];
      let content = [];

      for (let j = 0; j < data[12][i][1].length; j++) {
        let obj = {
          phrase: data[12][i][1][j][0],
          instance: data[12][i][1][j][2],
        };
        content.push(obj);
      }
      let section = {
        type,
        content,
      };
      definitions.push(section);
    }
    obj.definitions = definitions;
  }

  if (data[11]) {
    let synonyms = [];

    for (let i = 0; i < data[11].length; i++) {
      let type = data[11][i][0];
      let content = [];

      for (let j = 0; j < data[11][i][1].length; j++) {
        let arr = data[11][i][1][j][0];
        content.push(arr);
      }
      let section = {
        type,
        content,
      };
      synonyms.push(section);
    }
    obj.synonyms = synonyms;
  }

  if (data[13]) {
    let examples = [];
    for (let i = 0; i < data[13][0].length; i++) {
      examples.push(data[13][0][i][0]);
    }
    obj.examples = examples;
  }

  if (data[14]) {
    obj.seeAlso = data[14][0];
  }

  return obj;
}

function remapComplete(data) {
  data = JSON.parse(data.slice(19, -1));
  let obj = [];

  if (data[1]) {
    for (let i = 0; i < data[1].length; i++) {
      let s = data[1][i][0].replace(/\&#39;/gm, "'");
      obj.push(s);
    }
  }

  return obj;
}
