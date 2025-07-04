# PDF プレビュー機能 - インストール手順

## 概要
PDFプレビュー機能は完全に実装準備が完了しており、react-pdfライブラリのインストール後すぐに有効化できます。

## インストール手順

### 1. 依存関係のインストール
```bash
npm install react-pdf @types/react-pdf
```

### 2. コンポーネントの有効化

#### src/renderer/App.tsx
```typescript
// 26-27行目: インポートのコメントを解除
import PDFPreview from './components/PDFPreview';
```

```typescript
// 1038-1064行目: PDFPreviewコンポーネントの有効化
} else if (PDF_EXTENSIONS.includes(ext)) {
  return (
    <PDFPreview
      filePath={file.path}
      fileName={file.name}
      scale={currentScale}
      onScaleChange={setCurrentScale}
    />
  );
```

#### src/renderer/components/PDFPreview.tsx
```typescript
// 4-7行目: インポートのコメントを解除
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// 9-13行目: Worker設定のコメントを解除
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// 125-143行目: Documentコンポーネントのコメントを解除
<Document
  file={`file://${filePath}`}
  onLoadSuccess={onDocumentLoadSuccess}
  onLoadError={onDocumentLoadError}
  loading={<div>Loading PDF...</div>}
  error={<div>Failed to load PDF</div>}
>
  <Page
    pageNumber={pdfInfo.currentPage}
    scale={scale}
    loading={<div>Loading page...</div>}
    error={<div>Failed to load page</div>}
    renderTextLayer={false}
    renderAnnotationLayer={false}
  />
</Document>

// 145-160行目: プレースホルダーの削除
```

### 3. Jest設定の更新 (必要に応じて)

#### package.json
```json
"transformIgnorePatterns": [
  "node_modules/(?!(react-syntax-highlighter|react-pdf)/)"
]
```

### 4. CSP設定 (必要に応じて)
Electronのセキュリティ設定でPDF.js workerを許可する設定が必要な場合があります。

## 実装済み機能

### 基本機能
- ✅ PDFページレンダリング
- ✅ ページネーション（前/次ページ）
- ✅ ページ番号表示
- ✅ ズーム制御（+/-/フィット/オリジナル）
- ✅ エラーハンドリング
- ✅ ローディング状態表示

### UI/UX
- ✅ VS Code風統一デザイン
- ✅ レスポンシブレイアウト
- ✅ アクセシビリティ対応
- ✅ キーボードナビゲーション対応準備

## テスト

インストール後、以下でテスト実行：

```bash
# 単体テスト
npm run test:unit

# 統合テスト（PDFコンポーネント含む）
npm run test:integration

# 全テスト
npm test
```

## トラブルシューティング

### Worker関連エラー
- `pdfjs.GlobalWorkerOptions.workerSrc`設定を確認
- CSP設定でworkerスクリプト実行を許可

### ファイル読み込みエラー
- `file://`プロトコルの対応確認
- Electronのファイルアクセス権限確認

### メモリ使用量
- 大きなPDFファイルで`renderTextLayer={false}`を維持
- 必要に応じてページキャッシュサイズを調整

## パフォーマンス最適化

実装済みの最適化：
- テキストレイヤー無効化（軽量化）
- アノテーションレイヤー無効化
- ページごとの遅延読み込み
- メモリ効率を考慮したスケール制御

今後の改善案：
- ページキャッシュ機能
- サムネイル表示
- 全文検索機能
- 印刷プレビュー機能