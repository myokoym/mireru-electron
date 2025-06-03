# Mireru Electron - プロジェクト仕様書

## 概要
Mireruは、キーボード操作に特化したファイルエクスプローラーです。Ruby実装の[mireru](./reference/)をElectron + React + TypeScriptで再実装したものです。

## 技術スタック
- **フレームワーク**: Electron + React 19 + TypeScript
- **ベース**: electron-react-boilerplate
- **UI**: VS Code風の白基調デザイン
- **シンタックスハイライト**: react-syntax-highlighter (GitHub風スタイル)
- **開発環境**: WSL2 (Linux)

## 機能仕様

### サポートファイル形式
- **画像**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`
- **テキスト**: `.txt`, `.md`, `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.html`, `.css`, `.xml`, `.log`, `.py`, `.rb`, `.php`, `.java`, `.c`, `.cpp`, `.h`, `.sh`, `.yaml`, `.yml`
- **動画**: `.mp4`, `.avi`, `.mov`, `.webm`, `.mkv`, `.flv`
- **PDF**: `.pdf` (プレースホルダー表示)
- **バイナリ**: その他すべてのファイル（hexdump表示、20KB制限）

### キーバインド (Ruby実装準拠)

#### ナビゲーション
- `n` / `ArrowDown` - 次のファイル/ディレクトリ
- `p` / `ArrowUp` - 前のファイル/ディレクトリ
- `G` - 最後のアイテムに移動
- `Ctrl+g` - 最初のアイテムに移動

#### ファイル操作
- `Enter` / `e` - ディレクトリを開く、またはファイルをプレビュー
- `Space` - ファイルプレビュー
- `r` - 現在のファイルをリロード
- `Backspace` - 親ディレクトリに戻る
- `Home` - ホームディレクトリに移動

#### プレビューパネルスクロール (vim風)
- `h` - 左スクロール (17px)
- `j` - 下スクロール (17px)
- `k` - 上スクロール (17px)
- `l` - 右スクロール (17px)
- `H` - 大きく左スクロール (170px)
- `J` - 大きく下スクロール (170px)
- `K` - 大きく上スクロール (170px)
- `L` - 大きく右スクロール (170px)

#### 画像操作
- `+` / `=` - ズームイン (最大5倍)
- `-` - ズームアウト (最小0.1倍)
- `f` - ウィンドウにフィット
- `o` - オリジナルサイズ (1倍)

#### その他
- `Escape` - プレビューをクリア

### ファイルプレビュー仕様

#### 画像ファイル
- base64エンコードで表示
- ズーム機能付き
- transform: scale()でリアルタイム拡大縮小

#### テキストファイル
- **シンタックスハイライト**: 20以上の言語対応
  - JavaScript, TypeScript, Python, Ruby, Java, C/C++, Go, Rust
  - HTML, CSS, JSON, YAML, Markdown, SQL など
- **テーマ**: GitHub風ライトテーマ (UI統一性のため)
- **機能**: 行番号表示、モノスペースフォント
- **表示領域**: 最大化設計

#### 動画ファイル
- **最適化**: base64エンコード廃止、`file://` URL使用
- **機能**: HTML5 video要素、コントロール付き
- **エラーハンドリング**: 再生エラー時のフィードバック

#### バイナリファイル
- **hexdump**: Ruby実装準拠 (20KB制限)
- **フォーマット**: `offset  hex_bytes  |ascii|` 形式
- **スタイル**: モノスペースフォント、スクロール対応

#### PDFファイル
- プレースホルダーメッセージ表示
- 外部アプリケーションでの閲覧を推奨

## UI設計

### レイアウト
```
┌─────────────────────────────────────┐
│ Header (パスバー + コントロール)      │
├─────────────┬───────────────────────┤
│ ファイルリスト │ プレビューパネル        │
│ (300px固定)  │ (残り全域)            │
│             │                     │
│             │                     │
└─────────────┴───────────────────────┤
│ ステータスバー                        │
└─────────────────────────────────────┘
```

### カラーテーマ
- **ベース**: 白基調 (VS Code Light風)
- **選択アイテム**: `#007acc` (VS Code青)
- **フォント**: システムフォント + Monaco/Menlo (コード用)

### アイコン
- 📁 ディレクトリ
- 🖼️ 画像ファイル
- 📄 テキストファイル
- 🎬 動画ファイル
- 📋 PDFファイル

## アーキテクチャ

### ディレクトリ構成
```
src/
├── main/
│   ├── main.ts          # メインプロセス、IPC handlers
│   ├── preload.ts       # プリロードスクリプト、API公開
│   └── ...
└── renderer/
    ├── App.tsx          # メインコンポーネント
    ├── App.css          # スタイル定義
    └── ...
```

### IPC通信
- `get-directory-contents` - ディレクトリ内容取得
- `read-file` - ファイル内容読み込み
- `get-home-directory` - ホームディレクトリパス取得
- `get-parent-directory` - 親ディレクトリパス取得

### 状態管理
```typescript
interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: Date;
  extension: string;
}

interface FileResult {
  type: 'text' | 'image' | 'video' | 'pdf' | 'hex';
  content: string;
  size: number;
}
```

## 開発・運用

### 開発環境セットアップ
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start

# プロセス終了
pkill -f "mireru-electron"

# 再起動
pkill -f "mireru-electron" && npm start &
```

### ビルド
```bash
# 本番ビルド
npm run build

# パッケージング
npm run package
```

### デバッグ
- **レンダラープロセス**: ホットリロード対応
- **メインプロセス**: electronmon による自動再起動
- **DevTools**: 開発環境で自動利用可能

## パフォーマンス最適化

### メモリ最適化
- **動画ファイル**: base64エンコード廃止、file:// URL使用
- **バイナリファイル**: 20KB制限でメモリ使用量制御
- **ファイル表示**: 遅延読み込み、必要時のみプレビュー

### バンドルサイズ最適化
- **シンタックスハイライト**: Lightコンポーネント使用
- **言語パック**: 必要な言語のみ個別インポート

## 今後の改善案

### 機能拡張
- [ ] PDF本格プレビュー対応
- [ ] 動画プレビューの一時停止機能 (space key)
- [ ] より多くのファイル形式対応
- [ ] ファイル検索機能
- [ ] ブックマーク機能

### UI/UX改善
- [ ] ダークテーマ対応
- [ ] ファイルリストの幅調整
- [ ] キーバインドのカスタマイズ
- [ ] 設定画面の追加

### パフォーマンス
- [ ] 大きなディレクトリの仮想スクロール
- [ ] ファイルプレビューのキャッシュ
- [ ] Worker使用での非同期処理

## 参考実装
- Ruby版: `./reference/` - オリジナル実装
- 特に `window.rb` のキーバインド定義を参考

---

*最終更新: 2025/06/03*