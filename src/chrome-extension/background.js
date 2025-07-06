// Chrome Extension Background Script (Service Worker)
// Mireru File Explorer

// 拡張機能アイコンクリック時の処理
chrome.action.onClicked.addListener((tab) => {
  // 新しいタブでMireruを開く
  chrome.tabs.create({
    url: chrome.runtime.getURL('explorer.html')
  });
});

// インストール時の処理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // インストール時にウェルカムページを開く
    chrome.tabs.create({
      url: chrome.runtime.getURL('explorer.html')
    });
  }
});