import querystring from 'querystring';
import getToken from './token';
import axios, { AxiosResponse } from 'axios';
import { Langs } from './interfaces';

export async function translate(
  text: string,
  opts: Langs
): Promise<AxiosResponse> {
  const tk = await getToken(text);
  const url = 'https://translate.google.com/translate_a/single';
  const data = {
    client: 't',
    sl: opts.from,
    tl: opts.to,
    hl: opts.to,
    dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 1,
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
