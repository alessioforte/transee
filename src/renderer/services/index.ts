/* eslint-disable */
import { Langs } from './interfaces';
import { reversoTranslation, reversoSuggest } from './api';
import { reversoLangsConversion } from './langs';


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
