/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import os from 'os';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// 開発環境かどうか
const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

// File system operations for image explorer
ipcMain.handle('get-directory-contents', async (event, dirPath: string) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true, encoding: 'utf8' });
    const result = [];
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      let stat;
      
      try {
        stat = fs.statSync(fullPath);
      } catch (err) {
        continue; // Skip inaccessible files
      }
      
      result.push({
        name: item.name,
        path: fullPath,
        isDirectory: item.isDirectory(),
        isFile: item.isFile(),
        size: stat.size,
        modified: stat.mtime,
        extension: path.extname(item.name).toLowerCase()
      });
    }
    
    // Sort directories first, then files by name with proper Japanese locale
    result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, 'ja', { numeric: true });
    });
    
    return result;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : String(error)}`);
  }
});

ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // File size limit (10MB)
    if (stat.size > 10 * 1024 * 1024) {
      throw new Error('File too large');
    }
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(ext)) {
      // Image file
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      const mimeType = ext === '.svg' ? 'svg+xml' : ext.slice(1);
      return { 
        type: 'image', 
        content: `data:image/${mimeType};base64,${base64}`, 
        size: stat.size 
      };
    } else {
      // Other files (not needed for image explorer, but keeping for compatibility)
      return { type: 'text', content: 'Not an image file', size: stat.size };
    }
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
  }
});

ipcMain.handle('get-home-directory', () => {
  return os.homedir();
});

ipcMain.handle('get-parent-directory', (event, currentPath: string) => {
  const parent = path.dirname(currentPath);
  return parent !== currentPath ? parent : null;
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDev) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDev) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:1212');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  // Note: Hot reload is handled by electronmon when using npm run start:main
  // For npm start, only renderer hot reload is available via webpack-dev-server
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
