const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// メインウィンドウを保持する変数
let mainWindow;

function createWindow() {
  // ブラウザウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // HTMLファイルを読み込み
  mainWindow.loadFile('index.html');

  // ウィンドウが準備できたら表示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 開発者ツールを開く（開発時）
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// Electronの準備が完了したらウィンドウを作成
app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられたらアプリを終了（macOS以外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOSでドックアイコンがクリックされた時
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPCハンドラー設定
ipcMain.handle('get-directory-contents', async (event, dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = [];
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      let stat;
      
      try {
        stat = fs.statSync(fullPath);
      } catch (err) {
        continue; // アクセスできないファイルはスキップ
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
    
    // ディレクトリを先に、その後ファイルを名前順でソート
    result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return result;
  } catch (error) {
    throw new Error(`ディレクトリの読み込みに失敗: ${error.message}`);
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // ファイルサイズが大きすぎる場合は制限
    if (stat.size > 10 * 1024 * 1024) { // 10MB制限
      throw new Error('ファイルサイズが大きすぎます');
    }
    
    if (['.txt', '.md', '.js', '.json', '.html', '.css', '.xml', '.log'].includes(ext)) {
      // テキストファイル
      const content = fs.readFileSync(filePath, 'utf8');
      return { type: 'text', content, size: stat.size };
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
      // 画像ファイル
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      return { type: 'image', content: `data:image/${ext.slice(1)};base64,${base64}`, size: stat.size };
    } else {
      // その他のファイル（バイナリ表示）
      const buffer = fs.readFileSync(filePath);
      const hex = buffer.toString('hex').match(/.{1,2}/g).join(' ');
      return { type: 'hex', content: hex.substring(0, 2000), size: stat.size }; // 最初の1000バイトのみ
    }
  } catch (error) {
    throw new Error(`ファイルの読み込みに失敗: ${error.message}`);
  }
});

ipcMain.handle('get-home-directory', () => {
  return os.homedir();
});

ipcMain.handle('get-parent-directory', (event, currentPath) => {
  const parent = path.dirname(currentPath);
  return parent !== currentPath ? parent : null;
});

ipcMain.handle('open-external', async (event, filePath) => {
  try {
    await shell.openExternal(`file://${filePath}`);
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('show-item-in-folder', async (event, filePath) => {
  try {
    shell.showItemInFolder(filePath);
    return true;
  } catch (error) {
    return false;
  }
});