/* eslint-disable */
import { Langs, Hint, TranslationData } from './interfaces';
import {
  getGoogleTranslate,
  getGoogleSuggest,
  getGoogleVoice,
  reversoTranslation,
  reversoSuggest,
} from './api';
import { reversoLangsConversion } from './langs';

export const getHints = async (
  value: string,
  langs: Langs
): Promise<Hint[]> => {
  try {
    const { body } = await getGoogleSuggest(value, langs);
    const decode = JSON.parse(unescape(body.slice(5)));
    const data = JSON.parse(decode[0][2]);
    return data && data[0];
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
    const { body } = await getGoogleTranslate(value, langs);
    const decode = JSON.parse(unescape(body.slice(5)));
    const data = JSON.parse(decode[0][2]);
    return mapping(data);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const playAudio = async (
  text: string,
  lang: string,
  speed: boolean = false
) => {
  try {
    const { body } = await getGoogleVoice(text, lang, speed);
    const decode = JSON.parse(unescape(body.slice(5)));
    const data = JSON.parse(decode[0][2]);
    const voice = unescape(data[0]);
    const decoded = Uint8Array.from(atob(voice), (e) => e.charCodeAt(0));
    const context = new AudioContext();
    const source = context.createBufferSource();
    const audioBuffer = await context.decodeAudioData(decoded.buffer);
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(0);
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
  }
};

export const getReversoSuggest = async (
  value: string,
  langs: Langs
): Promise<any | null> => {
  try {
    const { data } = await reversoSuggest(value, langs);
    return data;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Mapping ---------------------------------------------------------------------
 */

function mapping(arr: any[]): any {
  const data = {
    pronunciation: arr[0][0],
    correction: arr[0][1] && arr[0][1],
    translation: arr[1][0],
    input: arr[1][4],
    definitions: arr[3] && arr[3][1] && arr[3][1][0], // verb, noun, adjective
    examples: arr[3] && arr[3][2] && arr[3][2][0].map((item) => item[1]),
    seeAlso: arr[3] && arr[3][3] && arr[3][3][0],
    synonyms: arr[3] && arr[3][4] && arr[3][4][0], // verb, noun, adjective
    translations: arr[3] && arr[3][5] && arr[3][5][0], // verb, noun, adjective
    //             arr && arr[3][6] ?
    //             arr && arr[3][7] ?
    //             arr && arr[3][8] ?
    //             arr && arr[3][9] ?
  };
  return data;
}
