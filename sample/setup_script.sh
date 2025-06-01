#!/bin/bash

echo "🚀 Mireru Electron プロジェクトセットアップ"

# プロジェクトディレクトリ作成
mkdir -p mireru-electron
cd mireru-electron

echo "📦 package.json を作成中..."
cat > package.json << 'EOF'
{
  "name": "mireru-electron",
  "version": "1.0.0",
  "description": "Keyboard friendly cross-platform file explorer - Mireru remake with Electron",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "electron . --dev",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac",
    "build-linux": "electron-builder --linux"
  },
  "keywords": ["file-explorer", "file-viewer", "keyboard-friendly", "electron"],
  "author": "Your Name",
  "license": "GPLv2",
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.6.4"
  },
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "sharp": "^0.33.0",
    "node-ffmpeg": "^0.6.13",
    "cheerio": "^1.0.0-rc.12",
    "mime-types": "^2.1.35"
  },
  "build": {
    "appId": "com.mireru.electron",
    "productName": "Mireru",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "renderer.js",
      "preload.js",
      "styles.css",
      "index.html",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.utilities"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
EOF

echo "⚡ main.js を作成中..."
# main.jsの内容をここに配置（長いのでスクリプトでは省略）

echo "🔗 preload.js を作成中..."
# preload.jsの内容をここに配置

echo "🎨 index.html を作成中..."
# index.htmlの内容をここに配置

echo "💅 styles.css を作成中..."
# styles.cssの内容をここに配置

echo "🖥️ renderer.js を作成中..."
# renderer.jsの内容をここに配置

echo "📦 依存関係をインストール中..."
npm install

echo "✅ セットアップ完了！"
echo ""
echo "🚀 アプリケーションを起動するには："
echo "   npm start"
echo ""
echo "🔧 開発モードで起動するには："
echo "   npm run dev"
echo ""
echo "📦 ビルドするには："
echo "   npm run build"
EOF