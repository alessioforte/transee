import axios, { AxiosResponse } from 'axios';
import { Langs } from './interfaces';
import * as nodeRequest from 'request';
import util from 'util';

const request = util.promisify(nodeRequest);

/**
 *
 * Google Translate APIs
 *
 */
const googleUrl =
  'https://translate.google.com/_/TranslateWebserverUi/data/batchexecute';

export async function getGoogleTranslate(
  text: string,
  opts: Langs
): Promise<any> {
  const { from, to } = opts;
  const options = {
    method: 'POST',
    url: googleUrl,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `f.req=%5B%5B%5B%22MkEWBc%22%2C%22%5B%5B%5C%22${encodeURI(
      text
    )}%5C%22%2C%5C%22${from}%5C%22%2C%5C%22${to}%5C%22%2Ctrue%5D%2C%5Bnull%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&`,
  };

  return await request(options);
}

export async function getGoogleSuggest(
  text: string,
  opts: Langs
): Promise<any> {
  const { from, to } = opts;
  const options = {
    method: 'POST',
    url: googleUrl,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `f.req=%5B%5B%5B%22AVdN8%22%2C%22%5B%5C%22${text}%5C%22%2C%5C%22${from}%5C%22%2C%5C%22${to}%5C%22%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AD08yZlUAjeA4YyDVJDBzlMdrQXB%3A1608905462662&`,
  };
  return request(options);
}

export async function getGoogleVoice(
  text: string,
  lang: string,
  speed: boolean
): Promise<any> {
  const options = {
    method: 'POST',
    url: googleUrl,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `f.req=%5B%5B%5B%22jQ1olc%22%2C%22%5B%5C%22${text}%5C%22%2C%5C%22${lang}%5C%22%2C${speed}%2C%5C%22null%5C%22%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AD08yZlUAjeA4YyDVJDBzlMdrQXB%3A1608905462662&`,
  };
  return request(options);
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
