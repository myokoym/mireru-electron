# Mireru Firefox Add-on

Firefox向けのvim風キーボードナビゲーション対応ファイルエクスプローラーです。

[English](README.md) | 日本語

## 特徴

- 🎯 **Vim風ナビゲーション**: `j/k`で上下移動、`Enter`でファイル/フォルダを開く
- 🖼️ **リッチプレビュー**: 画像、動画、シンタックスハイライト付きテキスト、PDFなど
- 🔍 **クイック検索**: `/`を押すとファイル検索が即座に開始
- 📊 **CSV対応**: スプレッドシート風テーブル表示
- 🎨 **モダンUI**: GitHub風のクリーンなデザイン

## インストール

### 一時的インストール（開発用）

1. Firefoxで `about:debugging` を開く
2. 「このFirefox」をクリック
3. 「一時的なアドオンを読み込む...」をクリック
4. `src/firefox-addon` フォルダに移動
5. `manifest.json` ファイルを選択

### 永続的インストール

1. アドオンをパッケージ化：
   ```bash
   cd src/firefox-addon
   zip -r mireru-firefox.zip * -x "*.md" -x ".*"
   ```

2. 署名のため [AMO (addons.mozilla.org)](https://addons.mozilla.org/) に提出

## 開発

### 必要要件

- Firefox Developer Edition（推奨）
- web-ext ツール: `npm install -g web-ext`

### 開発実行

```bash
cd src/firefox-addon
web-ext run
```

### ビルド

```bash
web-ext build
```

## ブラウザ互換性

このアドオンには以下が必要です：
- Firefox 109.0 以降
- File System Access API サポート

## Chrome拡張機能との違い

- API互換性のためWebExtension Polyfillを使用
- `chrome.*` と `browser.*` API両方をサポート
- Service Workerの代わりにbackground scriptsを使用
- Firefox固有のmanifest設定

## キーボードショートカット

### ナビゲーション
- `n/p` または `↑/↓` - 次/前のファイル
- `G` - 最後のアイテム
- `Ctrl+g` - 最初のアイテム
- `Enter/e/Space` - フォルダを開く/ファイルプレビュー
- `Backspace` - 上位ディレクトリ
- `Home` - 起動ディレクトリ

### 検索・操作
- `/` - 検索フォーカス
- `Escape` - 検索終了/プレビュークリア
- `Shift+Escape` - 検索クリア
- `i/F1` - メタデータサイドバー切り替え

### プレビュー操作
- `+/-` - 画像ズーム
- `hjkl` - スクロール（vim風）
- `HJKL` - 大幅スクロール
- `f` - ウィンドウフィット
- `o` - オリジナルサイズ

## ライセンス

メインMireruプロジェクトと同じ - ルートのLICENSEファイルを参照