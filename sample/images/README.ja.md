# 画像サンプル

このディレクトリには、Mireruの画像プレビュー機能をテストするためのサンプル画像が含まれています。

[English](README.md) | 日本語

## ファイル一覧

- `icon.svg` - SVGベクターグラフィック（Mireruロゴ）
- `photo.jpg` - グラデーション背景のJPEG写真
- `photo.webp` - WebP圧縮形式
- `diagram.png` - 透明背景付きPNG図表
- `animation.gif` - 4フレームのGIFアニメーション
- `sample.bmp` - 非圧縮BMPビットマップ

## テストポイント

1. 画像ズーム操作（`+`, `-`, `f`, `o`）
2. SVGレンダリングとスケーリング
3. GIFアニメーション再生
4. 各種画像形式（JPEG, PNG, WebP, BMP, SVG, GIF）
5. 透明度サポート（PNG）
6. モダン形式サポート（WebP）

## 使用方法

1. Mireruでこのディレクトリを開く
2. 各画像ファイルをクリックしてプレビュー
3. キーボードショートカットで画像操作をテスト：
   - `+/-` - ズームイン/アウト
   - `f` - ウィンドウにフィット
   - `o` - オリジナルサイズ
   - `hjkl` - スクロール（vim風）

## ファイルサイズ情報

- `icon.svg` - 986B（ベクター）
- `photo.jpg` - 35KB（高品質）
- `photo.webp` - 7.6KB（高圧縮）
- `diagram.png` - 6.5KB（透明背景）
- `animation.gif` - 15KB（4フレーム）
- `sample.bmp` - 469KB（非圧縮）