# Mireru Electron - ファイルエクスプローラー

VS Code風のUIを持つ、キーボード操作に特化したファイルエクスプローラーです。Electron + Reactで構築されています。

[English](README.md) | 日本語

## コンセプト

- **気軽に使えるexplorer**: vim風キーバインドによる直感的で効率的なファイル管理
- **VS Codeのような詳細表示**: 開発者に馴染みのあるUI/UXで、豊富なファイル情報とメタデータを提供

## 特徴

- 📁 **多彩なファイル対応**: テキスト、画像、動画、PDF、バイナリファイル
- ⌨️ **Vim風ナビゲーション**: 高速キーボード操作 (n/p, hjkl, /, など)
- 🔍 **インスタント検索**: リアルタイムファイルフィルタリング
- 📋 **リッチプレビュー**: シンタックスハイライト、画像ズーム、動画再生
- 🏠 **スマートナビゲーション**: コマンドライン引数、起動ディレクトリへの戻るボタン
- 📊 **ファイル詳細**: サイズ、更新日時、メタデータ表示
- 📊 **CSV対応**: スプレッドシート風テーブル表示

## ブラウザ拡張機能版

Mireruはブラウザ拡張機能としても利用できます：

### Chrome拡張機能
- **場所**: `src/chrome-extension/`
- **インストール**: Chrome拡張機能ページで「パッケージ化されていない拡張機能を読み込む」
- **特徴**: File System Access API使用、CSVスプレッドシート表示対応

### Firefox Add-on
- **場所**: `src/firefox-addon/`
- **インストール**: `about:debugging` → 「一時的なアドオンを読み込む」
- **特徴**: WebExtension Polyfill使用、Chrome版と機能互換

## 開発

### WSL2環境での開発 (Windows)

Windows上でWSL2を使用する場合、Windows向けElectronインストールが必要です：

```bash
# Windows プラットフォーム向けElectronインストール
npm install --save-dev electron --platform=win32

# Windows向け開発サーバー起動
npm run start:win32
```

### 標準的な開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

## ビルド

### Windowsビルド (WSL2から)

```bash
# Windowsインストーラーとポータブル版ビルド
npm run build:win32

# Windowsポータブル版のみビルド
npm run package:win32
```

### 標準ビルド

```bash
# 現在のプラットフォーム向けビルド
npm run build
```

## キーボードショートカット

### ナビゲーション
- `n/p` または `↑/↓` - 次/前のファイルに移動
- `G` - 最後のアイテムに移動
- `Ctrl+g` - 最初のアイテムに移動
- `Enter/e` - フォルダを開くまたはファイルプレビュー
- `Space` - ファイルプレビューのみ
- `Backspace` - 一つ上の階層に戻る
- `Home` - 起動ディレクトリに戻る

### 検索
- `/` - 検索ボックスにフォーカス
- `Escape` - 検索終了（テキスト保持）
- `Shift+Escape` - 検索クリア

### プレビュー・ファイル操作
- `+/-` - ズームイン/アウト（画像）
- `Ctrl++/-` - テキストサイズ拡大/縮小
- `Ctrl+0` - テキストサイズリセット
- `f` - ウィンドウにフィット
- `o` - オリジナルサイズ
- `hjkl` - プレビュースクロール（vim風）
- `HJKL` - プレビュー大幅スクロール
- `r` - 現在のファイルをリロード
- `i/F1` - メタデータサイドバー切り替え
- `Ctrl+Shift+C` - ファイルパスをコピー

## サポートファイル形式

### 画像
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`
- ズーム機能、transform: scale()でリアルタイム拡大縮小

### テキスト
- `.txt`, `.md`, `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.html`, `.css`, `.xml`, `.log`
- `.py`, `.rb`, `.php`, `.java`, `.c`, `.cpp`, `.h`, `.sh`, `.yaml`, `.yml`
- シンタックスハイライト対応（20以上の言語）

### 動画
- `.mp4`, `.avi`, `.mov`, `.webm`, `.mkv`, `.flv`
- HTML5 video要素、コントロール付き

### CSV
- `.csv`
- スプレッドシート風テーブル表示
- テキスト表示切り替え対応

### その他
- **PDF**: `.pdf` - プレースホルダー表示
- **バイナリ**: その他すべて - hexdump表示（20KB制限）

## テスト

```bash
# 単体テスト
npm run test:unit

# 統合テスト  
npm run test:integration

# 全テスト
npm test

# 開発用テスト（ファイル変更監視）
npm run test:watch
```

## サンプルファイル

プロジェクトには機能テスト用のサンプルファイルが含まれています：

- `sample/images/` - 各種画像形式（JPEG, PNG, GIF, SVG, WebP, BMP）
- `sample/csv/` - CSV形式のサンプルデータ
- `sample/text/` - テキストファイル
- `sample/videos/` - 動画ファイル

## インストール

リポジトリをクローンして依存関係をインストール：

```bash
git clone https://github.com/myokoym/mireru-electron.git
cd mireru-electron
npm install
```

## ライセンス

GPL-2.0

## 参考実装

Ruby版Mireru: `./reference/` - オリジナル実装