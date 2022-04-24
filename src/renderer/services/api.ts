import axios, { AxiosResponse } from 'axios';
import { Langs } from './interfaces';

/**
 *
 * Google Translate APIs
 *
 */
const googleUrl = 'https://translate.google.com/_/TranslateWebserverUi/data/batchexecute';

export async function getGoogleTranslate(
  text: string,
  opts: Langs
): Promise<any> {
  const { from, to } = opts;

  const arr = [[text, from, to, true], [null]]
  const data = [[["MkEWBc", JSON.stringify(arr), null, "generic"]]]

  const options = {
    method: 'POST',
    url: googleUrl,
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    data: `f.req=${encodeURI(JSON.stringify(data))}`,
  };

  return window.electron.request(options)
}

export async function getGoogleSuggest(
  text: string,
  opts: Langs
): Promise<any> {
  const { from, to } = opts;

  const arr = [text, from, to]
  const data = [[["AVdN8", JSON.stringify(arr), null, "generic"]]]

  const options = {
    method: 'POST',
    url: googleUrl,
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    data: `f.req=${encodeURI(JSON.stringify(data))}`,
  };

  return window.electron.request(options)
}

export async function getGoogleVoice(
  text: string,
  lang: string,
  speed: boolean
): Promise<any> {

  const arr = [text, lang, speed, null]
  const data = [[["jQ1olc", JSON.stringify(arr), null, "generic"]]]

  const options = {
    method: 'POST',
    url: googleUrl,
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    data: `f.req=${encodeURI(JSON.stringify(data))}`,
  };
  return window.electron.request(options)
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
  const data = {
    input,
    from: opts.from,
    to: opts.to,
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
  };

  return axios({
    method: 'POST',
    url: 'https://context.reverso.net/bst-suggest-service',
    data,
  });
}
