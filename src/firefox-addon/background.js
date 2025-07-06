// Firefox Add-on Background Script
// Mireru File Explorer

// browser-polyfillによりchromeとbrowser APIの両方をサポート
// FirefoxではbrowserがネイティブAPIとして利用可能
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

// 拡張機能アイコンクリック時の処理
extensionAPI.action.onClicked.addListener((tab) => {
  // 新しいタブでMireruを開く
  extensionAPI.tabs.create({
    url: extensionAPI.runtime.getURL('explorer.html')
  });
});

// インストール時の処理
extensionAPI.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // インストール時にウェルカムページを開く
    extensionAPI.tabs.create({
      url: extensionAPI.runtime.getURL('explorer.html')
    });
  }
});