declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
        send(channel: string, payload: any): void;
      };
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        clear: () => void;
        delete: (key: string) => void;
        // any other methods you've defined...
      };
      request: any
    };
  }
}

export {};
