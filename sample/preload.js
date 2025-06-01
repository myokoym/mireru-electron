const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスにAPIを安全に公開
contextBridge.exposeInMainWorld('electronAPI', {
  // ディレクトリの内容を取得
  getDirectoryContents: (dirPath) => ipcRenderer.invoke('get-directory-contents', dirPath),
  
  // ファイルを読み込み
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // ホームディレクトリを取得
  getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
  
  // 親ディレクトリを取得
  getParentDirectory: (currentPath) => ipcRenderer.invoke('get-parent-directory', currentPath),
  
  // 外部アプリケーションでファイルを開く
  openExternal: (filePath) => ipcRenderer.invoke('open-external', filePath),
  
  // ファイルマネージャーで表示
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath)
});