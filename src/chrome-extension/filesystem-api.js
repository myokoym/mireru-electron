// Chrome Extension File System Access API ラッパー
// Electron IPC の代替として動作

// File System Access API サポート確認
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
};

// ディレクトリハンドルのグローバル管理
let currentDirectoryHandle = null;
let currentPath = '';

// ディレクトリピッカーを表示
const pickDirectory = async () => {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser');
  }

  try {
    currentDirectoryHandle = await window.showDirectoryPicker();
    currentPath = currentDirectoryHandle.name;
    return currentPath;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('User cancelled directory selection');
    }
    throw error;
  }
};

// ディレクトリ内容を取得
const getDirectoryContents = async (dirPath) => {
  if (!currentDirectoryHandle) {
    throw new Error('No directory selected. Please select a directory first.');
  }

  try {
    let targetHandle = currentDirectoryHandle;
    let targetPath = currentPath;

    // サブディレクトリの場合はナビゲート
    if (dirPath && dirPath !== currentPath) {
      const relativePath = dirPath.replace(currentPath, '').replace(/^\/+/, '');
      if (relativePath) {
        const pathParts = relativePath.split('/').filter(part => part.length > 0);
        
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
        targetPath = dirPath;
      }
    }

    const items = [];
    
    for await (const [name, handle] of targetHandle.entries()) {
      const fullPath = `${targetPath}/${name}`.replace(/\/+/g, '/');
      
      if (handle.kind === 'directory') {
        items.push({
          name,
          path: fullPath,
          isDirectory: true,
          isFile: false,
          size: 0,
          modified: new Date(), // File System Access API では取得困難
          extension: ''
        });
      } else if (handle.kind === 'file') {
        const file = await handle.getFile();
        const extension = name.includes('.') ? '.' + name.split('.').pop().toLowerCase() : '';
        
        items.push({
          name,
          path: fullPath,
          isDirectory: false,
          isFile: true,
          size: file.size,
          modified: new Date(file.lastModified),
          extension
        });
      }
    }

    // ソート: ディレクトリ優先、その後名前順
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return items;
  } catch (error) {
    console.error('Error reading directory:', error);
    throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// ファイル内容を読み込み
const readFile = async (filePath) => {
  if (!currentDirectoryHandle) {
    throw new Error('No directory selected');
  }

  try {
    // パスからファイルハンドルを取得
    const relativePath = filePath.replace(currentPath, '').replace(/^\/+/, '');
    const pathParts = relativePath.split('/').filter(part => part.length > 0);
    const fileName = pathParts.pop();
    
    let targetHandle = currentDirectoryHandle;
    
    // ディレクトリをナビゲート
    for (const part of pathParts) {
      targetHandle = await targetHandle.getDirectoryHandle(part);
    }
    
    // ファイルハンドルを取得
    const fileHandle = await targetHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    
    const extension = fileName.includes('.') ? '.' + fileName.split('.').pop().toLowerCase() : '';
    
    // ファイル形式判定
    const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'];
    const PDF_EXTENSIONS = ['.pdf'];
    const CSV_EXTENSIONS = ['.csv'];
    const TEXT_EXTENSIONS = ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.xml', '.log', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h', '.sh', '.yaml', '.yml'];
    
    if (IMAGE_EXTENSIONS.includes(extension)) {
      // 画像ファイル - Blob URL作成
      const blob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(blob);
      
      return {
        type: 'image',
        content: url,
        size: file.size
      };
    } else if (VIDEO_EXTENSIONS.includes(extension)) {
      // 動画ファイル - Blob URL作成
      const blob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(blob);
      
      return {
        type: 'video',
        content: url,
        size: file.size
      };
    } else if (PDF_EXTENSIONS.includes(extension)) {
      // PDFファイル - Base64エンコード
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      
      return {
        type: 'pdf',
        content: `data:application/pdf;base64,${base64}`,
        size: file.size
      };
    } else if (CSV_EXTENSIONS.includes(extension)) {
      // CSVファイル - テキストとして読み込み
      let content;
      let isPartial = false;
      
      if (file.size > 1024 * 1024) {
        // 1MB以上は部分読み込み
        const slice = file.slice(0, 100 * 1024);
        content = await slice.text();
        isPartial = true;
      } else {
        content = await file.text();
      }
      
      return {
        type: 'csv',
        content,
        size: file.size,
        isPartial
      };
    } else if (TEXT_EXTENSIONS.includes(extension) || file.size < 50 * 1024) {
      // テキストファイル or 小さなファイル
      let content;
      let isPartial = false;
      
      if (file.size > 1024 * 1024) {
        // 1MB以上は部分読み込み
        const slice = file.slice(0, 100 * 1024);
        content = await slice.text();
        isPartial = true;
      } else {
        content = await file.text();
      }
      
      return {
        type: 'text',
        content,
        size: file.size,
        isPartial
      };
    } else {
      // バイナリファイル - hexdump
      const maxSize = 20 * 1024; // 20KB制限
      const arrayBuffer = await file.slice(0, maxSize).arrayBuffer();
      const hexContent = arrayBufferToHex(arrayBuffer);
      
      return {
        type: 'hex',
        content: hexContent,
        size: file.size,
        isPartial: file.size > maxSize
      };
    }
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// 親ディレクトリパスを取得
const getParentDirectory = async (currentPath) => {
  const pathParts = currentPath.split('/').filter(part => part.length > 0);
  if (pathParts.length <= 1) {
    return currentPath; // ルートディレクトリの場合
  }
  
  pathParts.pop();
  return pathParts.join('/') || '/';
};

// ホームディレクトリ（実際は選択されたルートディレクトリ）
const getHomeDirectory = async () => {
  return currentPath || '/';
};

// 初期ディレクトリ（実際は選択されたディレクトリ）
const getInitialDirectory = async () => {
  return currentPath || '/';
};

// クリップボードにコピー
const copyToClipboard = async (text) => {
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(text);
  } else {
    // フォールバック
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

// ユーティリティ関数
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function arrayBufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hexContent = '';
  
  for (let i = 0; i < bytes.length; i += 16) {
    // オフセット
    const offset = i.toString(16).padStart(8, '0');
    
    // HEXバイト
    let hexBytes = '';
    let asciiChars = '';
    
    for (let j = 0; j < 16; j++) {
      if (i + j < bytes.length) {
        const byte = bytes[i + j];
        hexBytes += byte.toString(16).padStart(2, '0') + ' ';
        asciiChars += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
      } else {
        hexBytes += '   ';
        asciiChars += ' ';
      }
    }
    
    hexContent += `${offset}  ${hexBytes} |${asciiChars}|\n`;
  }
  
  return hexContent;
}

// 現在のパスを取得
const getCurrentPath = () => {
  return currentPath;
};

// ディレクトリが選択されているかチェック
const isDirectorySelected = () => {
  return currentDirectoryHandle !== null;
};

// Chrome Extension のためのストレージ機能
const saveLastDirectory = async (path) => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      await chrome.storage.local.set({ lastDirectory: path });
    } catch (error) {
      console.warn('Failed to save last directory:', error);
    }
  }
};

const loadLastDirectory = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    try {
      const result = await chrome.storage.local.get(['lastDirectory']);
      return result.lastDirectory || null;
    } catch (error) {
      console.warn('Failed to load last directory:', error);
    }
  }
  return null;
};

// Web API 互換のelectronAPI風インターフェース
const webElectronAPI = {
  getDirectoryContents,
  readFile,
  getHomeDirectory,
  getInitialDirectory,
  getParentDirectory,
  copyToClipboard,
  
  // Web固有のメソッド
  pickDirectory,
  isFileSystemAccessSupported,
  getCurrentPath,
  isDirectorySelected,
  
  // Chrome Extension固有のメソッド
  saveLastDirectory,
  loadLastDirectory
};

// グローバルに公開（Chrome Extension用）
window.webElectronAPI = webElectronAPI;
window.isFileSystemAccessSupported = isFileSystemAccessSupported;
window.pickDirectory = pickDirectory;
window.getCurrentPath = getCurrentPath;
window.isDirectorySelected = isDirectorySelected;