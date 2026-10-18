import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/platform', () => ({ batchexecute: vi.fn() }));

import { batchexecute } from '@/platform';
import {
  getTranslation,
  getWebsiteTranslationUrl,
} from '@/services/google/client';
import { toRows } from '@/services/google/parse';

const fixture = (name: string) =>
  readFileSync(join(__dirname, '../../fixtures', name), 'utf8');

const send = vi.mocked(batchexecute);
const rpcOf = (call: unknown[]) => decodeURI(String(call[0])).match(/"(\w{6})"/)?.[1];

// A well-formed envelope whose MkEWBc payload no longer matches `map`.
const reshaped = `)]}'\n\n[["wrb.fr","MkEWBc","[]",null,null,null,"generic"]]`;

describe('getTranslation', () => {
  beforeEach(() => {
    send.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('uses GetTranslation when it parses', async () => {
    send.mockResolvedValueOnce(fixture('translation.txt'));
    const google = await getTranslation('hello world', { from: 'en', to: 'it' });
    expect(toRows(google)[0][0]).toBe('Ciao mondo ');
    expect(send.mock.calls.map(rpcOf)).toEqual(['MkEWBc']);
  });

  it('keeps the web-address answer without falling back', async () => {
    send.mockResolvedValueOnce(fixture('translation-website.txt'));
    const google = await getTranslation('https://example.com/', { from: 'en', to: 'it' });
    expect(toRows(google)[0][0]).toBe('https://example.com/');
    expect(send.mock.calls.map(rpcOf)).toEqual(['MkEWBc']);
  });

  it('falls back to GetSimpleTextTranslation when the layout changes', async () => {
    send
      .mockResolvedValueOnce(reshaped)
      .mockResolvedValueOnce(fixture('simple.txt'));
    const google = await getTranslation('hello world', { from: 'en', to: 'it' });
    expect(toRows(google)).toEqual([['Ciao mondo']]);
    expect(send.mock.calls.map(rpcOf)).toEqual(['MkEWBc', 'MKPkhb']);
  });

  it('still rejects when the transport fails', async () => {
    send.mockRejectedValue(new Error('offline'));
    await expect(
      getTranslation('hello world', { from: 'en', to: 'it' })
    ).rejects.toThrow('offline');
  });
});

describe('getWebsiteTranslationUrl', () => {
  it('builds the URL behind "Translate website"', () => {
    const url = new URL(
      getWebsiteTranslationUrl('https://example.com/a?b=1', {
        from: 'auto',
        to: 'it',
      })
    );
    expect(url.origin + url.pathname).toBe('https://translate.google.com/translate');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      sl: 'auto',
      tl: 'it',
      hl: 'en',
      u: 'https://example.com/a?b=1',
      client: 'webapp',
    });
  });
});
