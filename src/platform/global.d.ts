import type { Bootstrap } from './env';

declare global {
  interface Window {
    __TRANSEE__?: Bootstrap;
  }
}

export {};
