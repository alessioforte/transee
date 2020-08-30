import querystring from 'querystring';
import getToken from './token';
import axios, { AxiosResponse } from 'axios';
import { Langs } from './interfaces';
import { reversoLangsConversion } from './langs';

/**
 * 
 * Google Translate APIs
 * 
 */

export async function translate(
  text: string,
  opts: Langs
): Promise<AxiosResponse> {
  const tk = await getToken(text);
  const url = 'https://translate.google.com/translate_a/single';
  const data = {
    client: 'webapp',
    sl: opts.from,
    tl: opts.to,
    hl: opts.to,
    dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'sos', 'ss', 't', 'gt'],
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
    tk: tk.value,
    q: text,
  };

  return await axios({
    method: 'get',
    url: url + '?' + querystring.stringify(data),
  });
}

export async function complete(
  text: string,
  lang: string
): Promise<AxiosResponse> {
  const url = 'https://clients1.google.com/complete/search';
  const data = {
    q: text,
    client: 'translate-web',
    ds: 'translate',
    ie: 'UTF-8',
    oe: 'UTF-8',
    hl: lang,
  };
  return await axios({
    method: 'get',
    url: url + '?' + querystring.stringify(data),
  });
}

export async function translateComplete(
  words: string[],
  opts: Langs
): Promise<AxiosResponse> {
  const text = words.join('');
  const tk = await getToken(text);
  const url = 'https://translate.google.com/translate_a/t';
  const data = {
    client: 't',
    sl: opts.from,
    tl: opts.to,
    hl: opts.to,
    v: '1.0',
    source: 'is',
    ie: 'UTF-8',
    oe: 'UTF-8',
    tk: tk.value,
    q: [...words],
  };

  return await axios({
    method: 'get',
    url: url + '?' + querystring.stringify(data),
  });
}

export async function voice(
  text: string,
  lang: string,
  speed: boolean
): Promise<string> {
  const textlen = text.length;
  const tk = await getToken(text);
  const url = 'https://translate.google.com/translate_tts';
  const data = {
    ie: 'UTF-8',
    q: text,
    tl: lang,
    total: 1,
    idx: 0,
    textlen: textlen,
    tk: tk.value,
    client: 't',
    prev: 'input',
    ttsspeed: speed && 0.24,
  };

  return url + '?' + querystring.stringify(data);
}

/**
 * 
 * Reverso Context APIs
 * 
 */

export async function reversoTranslation(
  input: string,
  opts: Langs
): Promise<AxiosResponse> {
  const from = reversoLangsConversion[opts.from];
  const to = reversoLangsConversion[opts.to];

  const data = {
    input,
    from,
    to,
    format: 'text',
    options: {
      origin: 'reversodesktop',
      sentenceSplitter: true,
      contextResults: true,
      languageDetection: true,
    },
  };
  return axios({
    method: 'POST',
    url: 'https://api.reverso.net/translate/v1/translation',
    data,
  });
}

export async function reversoSuggest(
  input: string,
  opts: Langs
): Promise<AxiosResponse> {

  const data = {
    search: input,
    source_lang: opts.from,
    target_lang: opts.to,
  }

  return axios({
    method: 'POST',
    url: 'https://context.reverso.net/bst-suggest-service',
    data,
  })
}