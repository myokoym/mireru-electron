# Changelog - Mireru Electron

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-07-05

### Added
- **PDF プレビュー機能**
  - react-pdf による完全なPDFビューア実装
  - Base64データ読み込みとWorker設定の最適化
  - ズーム機能（+/-、f、o）とページナビゲーション（←→）
  - vim風キーボードスクロール（hjkl + HJKL）対応
- **デモ環境拡張**
  - PDF サンプルファイルとテスト環境
  - 自動テストスクリプト（test-pdf-preview.sh）
  - PDF インストール手順ドキュメント（PDF_INSTALL.md）

### Changed
- Worker設定: CDN → import.meta.url ベース（現代的アプローチ）
- PDF読み込み: 直接ファイルパス → Base64データ変換方式
- PDF表示: プレースホルダー → 完全なビューア機能

### Fixed
- PDF プレビューの二重スクロールバー問題解消
- キーボードナビゲーションの PDF 対応
- react-pdf Worker 読み込みエラーの解決
- Electron環境でのPDF.js設定問題

## [0.2.0] - 2025-06-29

### Added
- **パフォーマンス最適化**
  - ディレクトリ読み込み高速化（並列I/O処理、Promise.all使用）
  - 大容量テキストファイル対応（1MB以上は100KB部分読み込み）
  - 遅延シンタックスハイライト（50KB以上のファイルで500ms遅延）
  - ディレクトリキャッシュ機能（最大10エントリ、LRU方式）
  - 大容量ディレクトリ対応（500+ファイル時の遅延レンダリング）
  - テスト実行時間最適化（70秒→20秒、65%短縮）
- **デモ環境**
  - サンプルファイル構成（text/code/data/images/videos/binary/large/mixed）
  - パフォーマンステスト用大容量ファイル（500KB JS、465KB テキスト）
  - 各ファイルタイプのデモサンプル作成
- **開発環境改善**
  - Jest設定最適化（canvas mock、環境分離）
  - テンプレートファイル整理（LICENSE、CHANGELOG、README更新）

### Changed
- メインプロセス：同期fs.statSync → 非同期fs.promises.stat
- レンダラー：ディレクトリ変更時の完全状態リセット
- パッケージバージョン：0.1.0 → 0.2.0
- 著作権表記：2025 Mireru Project

### Fixed
- 大容量ファイル選択時のUI凍結問題
- ディレクトリナビゲーション（Backspace）の応答性向上
- テキストプレビューの読み込み状態管理
- Escapeキーによる非同期処理キャンセル機能

## [0.1.0] - 2024-XX-XX

### Added
- 初期リリース
- vim風キーバインドによるファイルナビゲーション
- 複数ファイル形式対応（テキスト、画像、動画、PDF、バイナリ）
- VS Code風の白基調デザイン
- リアルタイムファイル検索
- プレビュー機能（シンタックスハイライト、画像ズーム、動画再生）
- 3パネル構成（ファイルリスト・プレビュー・メタ情報）
- Electron + React + TypeScript構成

[Unreleased]: https://github.com/myokoym/mireru-electron/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/myokoym/mireru-electron/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/myokoym/mireru-electron/releases/tag/v0.1.0