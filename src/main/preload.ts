import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const validChannels = ['store-get', 'store-set', 'store-delete', 'store-has', 'request', 'response'];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel: string, func: (...args: unknown[]) => void) {
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, subscription);

        return () => ipcRenderer.removeListener(channel, subscription);
      }

      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
    send(channel: string, payload: any) {
      ipcRenderer.send(channel, payload)
    }
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('store-get', key);
    },
    set(key: string, value: any) {
      ipcRenderer.send('store-set', key, value);
    },
    delete(key: string) {
      ipcRenderer.send('store-delete', key);
    },
    clear() {
      ipcRenderer.send('store-clear');
    },
    has(key: string) {
      ipcRenderer.send('store-has', key);
    }
  },
  request: async (options: any, operation?: string) => {
    return ipcRenderer.send('request', options, operation);
  }
});
