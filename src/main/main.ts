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
import { app, BrowserWindow, shell, ipcMain, clipboard } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import os from 'os';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { parseInitialDirectory } from './argument-parser';

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
    
    // 並列処理でファイル情報を取得
    const fileInfoPromises = items.map(async (item) => {
      const fullPath = path.join(dirPath, item.name);
      
      try {
        // 非同期でstat情報を取得
        const stat = await fs.promises.stat(fullPath);
        
        return {
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          isFile: item.isFile(),
          size: stat.size,
          modified: stat.mtime,
          extension: path.extname(item.name).toLowerCase()
        };
      } catch (err) {
        // アクセスできないファイルはnullを返す
        return null;
      }
    });
    
    // 全てのPromiseを並列実行
    const fileInfoResults = await Promise.all(fileInfoPromises);
    
    // nullを除外してresultに追加
    const result = fileInfoResults.filter(item => item !== null);
    
    // Sort directories first, then files by name with proper Japanese locale
    result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, 'ja', { numeric: true });
    });
    
    return result;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
});

// テキストファイル最適化読み込み関数
async function readTextFileOptimized(filePath: string, fileSize: number) {
  const MAX_FULL_SIZE = 1024 * 1024; // 1MB
  const PREVIEW_SIZE = 100 * 1024; // 100KB
  const MAX_LINES = 1000; // 最大1000行
  
  try {
    // 小さなファイルは全体を読み込み
    if (fileSize <= MAX_FULL_SIZE) {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return { 
        type: 'text', 
        content, 
        size: fileSize,
        isPartial: false
      };
    }
    
    // 大きなファイルは部分読み込み
    const fd = await fs.promises.open(filePath, 'r');
    try {
      const buffer = Buffer.alloc(PREVIEW_SIZE);
      const { bytesRead } = await fd.read(buffer, 0, PREVIEW_SIZE, 0);
      
      let content = buffer.subarray(0, bytesRead).toString('utf8');
      
      // 行数制限
      const lines = content.split('\n');
      if (lines.length > MAX_LINES) {
        content = lines.slice(0, MAX_LINES).join('\n');
      }
      
      // 不完全な最後の行を削除（文字化け防止）
      const lastNewlineIndex = content.lastIndexOf('\n');
      if (lastNewlineIndex > 0 && content.length > lastNewlineIndex + 1) {
        content = content.substring(0, lastNewlineIndex);
      }
      
      return {
        type: 'text',
        content: content + `\n\n--- Preview (first ${Math.floor(bytesRead / 1024)}KB of ${Math.floor(fileSize / 1024)}KB) ---\n--- File too large for full preview ---`,
        size: fileSize,
        isPartial: true,
        previewSize: bytesRead
      };
    } finally {
      await fd.close();
    }
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

// テキストファイル判定のヘルパー関数
function isTextFile(buffer: Buffer, extension: string): boolean {
  // 既知の拡張子は既存の分類に従う
  const textExtensions = ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.xml', '.log', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h', '.sh', '.yaml', '.yml'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const videoExtensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'];
  const pdfExtensions = ['.pdf'];
  
  if (textExtensions.includes(extension) || imageExtensions.includes(extension) || 
      videoExtensions.includes(extension) || pdfExtensions.includes(extension)) {
    return false; // 既知の拡張子は既存処理に任せる
  }
  
  // バッファが空の場合はテキストとして扱う
  if (buffer.length === 0) return true;
  
  // 最初の1KBを分析（ファイルサイズが小さければ全体）
  const sampleSize = Math.min(1024, buffer.length);
  const sample = buffer.subarray(0, sampleSize);
  
  // ヌルバイトがあればバイナリ
  if (sample.includes(0)) return false;
  
  // 制御文字の割合をチェック（タブ、改行、キャリッジリターンは除く）
  let controlChars = 0;
  let printableChars = 0;
  
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    if (byte === 9 || byte === 10 || byte === 13) {
      // タブ、LF、CRは有効な文字
      printableChars++;
    } else if (byte < 32 || byte > 126) {
      // ASCII制御文字または非ASCII
      if (byte < 32) {
        controlChars++;
      } else {
        // 高位ビット文字（UTF-8の可能性）
        printableChars++;
      }
    } else {
      // 印刷可能ASCII文字
      printableChars++;
    }
  }
  
  // 制御文字が20%以上ならバイナリとみなす
  const totalChars = printableChars + controlChars;
  if (totalChars === 0) return true;
  
  const controlRatio = controlChars / totalChars;
  return controlRatio < 0.2;
}

ipcMain.handle('read-file', async (event, filePath: string, viewMode: string = 'auto') => {
  try {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // File size limit (10MB)
    if (stat.size > 10 * 1024 * 1024) {
      throw new Error('File too large');
    }
    
    // Handle manual view mode overrides
    if (viewMode === 'binary') {
      // Force binary (hex) view for any file
      const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
      const limitedBuffer = buffer.subarray(0, 20 * 1024);
      const hexLines = [];
      
      for (let i = 0; i < limitedBuffer.length; i += 16) {
        const chunk = limitedBuffer.subarray(i, Math.min(i + 16, limitedBuffer.length));
        const offset = i.toString(16).padStart(8, '0');
        const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
        hexLines.push(`${offset}  ${hex.padEnd(47, ' ')}  |${ascii}|`);
      }
      
      return { type: 'hex', content: hexLines.join('\n'), size: stat.size };
    }
    
    if (viewMode === 'text') {
      // Force text view for any file (except images/videos/PDFs that are better shown in their native format)
      if (!['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv', '.pdf'].includes(ext)) {
        try {
          return await readTextFileOptimized(filePath, stat.size);
        } catch (error) {
          // If text reading fails, fall back to hex
          const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
          const limitedBuffer = buffer.subarray(0, 20 * 1024);
          const hexLines = [];
          
          for (let i = 0; i < limitedBuffer.length; i += 16) {
            const chunk = limitedBuffer.subarray(i, Math.min(i + 16, limitedBuffer.length));
            const offset = i.toString(16).padStart(8, '0');
            const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
            const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
            hexLines.push(`${offset}  ${hex.padEnd(47, ' ')}  |${ascii}|`);
          }
          
          return { type: 'hex', content: hexLines.join('\n'), size: stat.size };
        }
      }
    }
    
    // Auto mode (default behavior)
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
    } else if (['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.xml', '.log', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h', '.sh', '.yaml', '.yml'].includes(ext)) {
      // Text file with size optimization
      return await readTextFileOptimized(filePath, stat.size);
    } else if (['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'].includes(ext)) {
      // Video file - use file URL to avoid memory issues
      return { 
        type: 'video', 
        content: `file://${filePath}`, 
        size: stat.size 
      };
    } else if (['.pdf'].includes(ext)) {
      // PDF file - return base64 for react-pdf
      console.log('📄 Main process: Reading PDF file:', filePath);
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      console.log('📄 Main process: PDF file read successfully, size:', buffer.length);
      return { 
        type: 'pdf', 
        content: `data:application/pdf;base64,${base64}`, 
        size: stat.size,
        filePath: filePath // レンダラーでのデバッグ用
      };
    } else {
      // Unknown extension - detect based on content
      const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
      
      if (isTextFile(buffer, ext)) {
        // Treat as text file with optimization
        try {
          return await readTextFileOptimized(filePath, stat.size);
        } catch (error) {
          // UTF-8 decode failed, treat as binary
        }
      }
      
      // Binary file (hex dump) - limit to 20KB like Ruby reference
      const limitedBuffer = buffer.subarray(0, 20 * 1024);
      const hexLines = [];
      
      for (let i = 0; i < limitedBuffer.length; i += 16) {
        const chunk = limitedBuffer.subarray(i, Math.min(i + 16, limitedBuffer.length));
        const offset = i.toString(16).padStart(8, '0');
        const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
        hexLines.push(`${offset}  ${hex.padEnd(47, ' ')}  |${ascii}|`);
      }
      
      return { type: 'hex', content: hexLines.join('\n'), size: stat.size };
    }
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

ipcMain.handle('get-home-directory', () => {
  return os.homedir();
});

ipcMain.handle('get-initial-directory', () => {
  return parseInitialDirectory(process.argv);
});

ipcMain.handle('get-parent-directory', (event, currentPath: string) => {
  const parent = path.dirname(currentPath);
  return parent !== currentPath ? parent : null;
});

ipcMain.handle('copy-to-clipboard', (event, text: string) => {
  try {
    clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
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

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
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
  if (isDebug) {
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
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

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
