# Changelog - Mireru Electron

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- テストパフォーマンス最適化（実行時間を70秒から20秒に65%短縮）
- メタ情報サイドバー（ファイル詳細情報の表示/非表示切り替え）
- ファイルリストの幅調整機能（ドラッグでリサイズ）
- テキストサイズ拡大縮小機能（Ctrl+Plus/Minus）
- 文字数・行数・バイト数カウント表示
- ファイルパスコピー機能（Ctrl+Shift+C）
- ナビゲーション幅を可変に（ドラッグでリサイズ）
- ホームボタンを起動時ディレクトリに変更（引数対応）
- ナビゲーションボタンSVGアイコン化（文字化け解決）
- ステータスバーの動的カウント更新（検索・ナビゲーション対応）
- ファイルリスト自動スクロール（選択項目の可視化）
- コマンドライン引数サポート（起動時ディレクトリ指定）
- ファイル検索機能（検索フォーカス時キーバインド無効化対応）
- キーバインド整理（Ruby準拠）
- ウィンドウリサイズ機能
- シンタックスハイライト機能
- 内容ベースファイル判定
- 言語固有SVGアイコン実装

### Changed
- SPEC.mdをCLAUDE.mdにリネーム（Claude Code統合対応）
- タスク管理の重複を排除（TODO.mdへの参照に統一）
- 開発ワークフローの改善（テスト → 再起動の順序）

### Fixed
- TODO.mdの機能反映を正確に更新

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

[Unreleased]: https://github.com/myokoym/mireru-electron/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/myokoym/mireru-electron/releases/tag/v0.1.0