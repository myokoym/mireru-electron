// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

// API for image explorer
const electronAPI = {
  getDirectoryContents: (dirPath: string) => 
    ipcRenderer.invoke('get-directory-contents', dirPath),
  readFile: (filePath: string) => 
    ipcRenderer.invoke('read-file', filePath),
  getHomeDirectory: () => 
    ipcRenderer.invoke('get-home-directory'),
  getInitialDirectory: () => 
    ipcRenderer.invoke('get-initial-directory'),
  getParentDirectory: (currentPath: string) => 
    ipcRenderer.invoke('get-parent-directory', currentPath),
  copyToClipboard: (text: string) => 
    ipcRenderer.invoke('copy-to-clipboard', text),
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronHandler = typeof electronHandler;
