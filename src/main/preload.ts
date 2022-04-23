import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
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
      const validChannels = ['ipc-example'];
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
    has(key: string) {
      ipcRenderer.send('store-has', key);
    }
  },
  request(options: any) {
    return ipcRenderer.sendSync('request', options);
  }
});
