import { ElectronHandler } from '../main/preload';

interface ElectronAPI {
  getDirectoryContents: (dirPath: string) => Promise<any[]>;
  readFile: (filePath: string) => Promise<any>;
  getHomeDirectory: () => Promise<string>;
  getParentDirectory: (currentPath: string) => Promise<string | null>;
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    electronAPI: ElectronAPI;
  }
}

export {};
