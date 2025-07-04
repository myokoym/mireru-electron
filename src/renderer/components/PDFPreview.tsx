// PDF プレビューコンポーネント（react-pdf使用）
import React, { useState, useCallback, useEffect } from 'react';

// react-pdf 有効化
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// PDF.js worker設定 - 現代的なアプローチ
try {
  // Method 1: import.meta.url (推奨)
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  console.log('✅ Worker configured with import.meta.url:', pdfjs.GlobalWorkerOptions.workerSrc);
} catch (error) {
  console.warn('⚠️ import.meta.url failed, falling back to CDN:', error);
  // Fallback: CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  console.log('📡 Worker configured with CDN:', pdfjs.GlobalWorkerOptions.workerSrc);
}

interface PDFPreviewProps {
  filePath: string;
  fileName: string;
  scale: number;
  onScaleChange: (scale: number) => void;
}

interface PDFInfo {
  numPages: number;
  currentPage: number;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  filePath, 
  fileName, 
  scale, 
  onScaleChange 
}) => {
  const [pdfInfo, setPdfInfo] = useState<PDFInfo>({ numPages: 0, currentPage: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  
  // デバッグログ
  console.log('=== PDF Preview Debug Info ===');
  console.log('PDFPreview - filePath:', filePath);
  console.log('PDFPreview - fileName:', fileName);
  console.log('PDFPreview - scale:', scale);
  console.log('PDFPreview - loading:', loading);
  console.log('PDFPreview - error:', error);
  console.log('PDFPreview - pdfInfo:', pdfInfo);
  console.log('PDFPreview - pdfData length:', pdfData ? pdfData.length : 0);
  console.log('=== End PDF Debug Info ===');

  // PDFファイルの読み込み
  useEffect(() => {
    const loadPDFData = async () => {
      try {
        console.log('🔄 Loading PDF data from:', filePath);
        setLoading(true);
        setError(null);
        
        const result = await window.electronAPI.readFile(filePath);
        console.log('📄 PDF file read result:', { type: result.type, size: result.size });
        
        if (result.type === 'pdf' && result.content) {
          console.log('✅ PDF data loaded successfully');
          console.log('📊 Base64 data preview:', result.content.substring(0, 100) + '...');
          console.log('📊 Data starts with:', result.content.startsWith('data:application/pdf;base64,'));
          setPdfData(result.content);
          setLoading(false); // Base64データが準備完了
        } else {
          throw new Error('Invalid PDF data received');
        }
      } catch (err) {
        console.error('❌ Failed to load PDF data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
        setLoading(false);
      }
    };

    loadPDFData();
  }, [filePath]);

  // PDF読み込み成功時
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('✅ PDF loaded successfully, pages:', numPages);
    console.log('✅ File path was:', filePath);
    setPdfInfo(prev => ({ ...prev, numPages }));
    setLoading(false);
    setError(null);
  }, [filePath]);

  // PDF読み込み失敗時
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('❌ PDF load error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('❌ File path was:', filePath);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, [filePath]);

  // ページ変更
  const changePage = useCallback((delta: number) => {
    setPdfInfo(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(prev.numPages, prev.currentPage + delta))
    }));
  }, []);

  // ズーム制御
  const handleZoom = useCallback((zoomDelta: number) => {
    const newScale = Math.max(0.1, Math.min(5.0, scale + zoomDelta));
    onScaleChange(newScale);
  }, [scale, onScaleChange]);

  const handleFitToWindow = useCallback(() => {
    onScaleChange(1.0); // 実際にはウィンドウサイズに基づいた計算が必要
  }, [onScaleChange]);

  const handleOriginalSize = useCallback(() => {
    onScaleChange(1.0);
  }, [onScaleChange]);

  if (loading) {
    return (
      <div className="pdf-preview-loading">
        <p>Loading PDF: {fileName}</p>
        <p>Status: {pdfData ? 'Data loaded, initializing PDF...' : 'Reading file...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-preview-error">
        <p>PDF Preview Error</p>
        <p>{error}</p>
        <p>Use external application to view: {fileName}</p>
      </div>
    );
  }

  return (
    <div className="pdf-preview">
      {/* PDF コントロールバー */}
      <div className="pdf-controls">
        <div className="pdf-navigation">
          <button 
            onClick={() => changePage(-1)} 
            disabled={pdfInfo.currentPage <= 1}
            title="Previous page"
          >
            ←
          </button>
          <span className="pdf-page-info">
            Page {pdfInfo.currentPage} of {pdfInfo.numPages}
          </span>
          <button 
            onClick={() => changePage(1)} 
            disabled={pdfInfo.currentPage >= pdfInfo.numPages}
            title="Next page"
          >
            →
          </button>
        </div>
        
        <div className="pdf-zoom">
          <button onClick={() => handleZoom(-0.2)} title="Zoom out">-</button>
          <span className="pdf-scale">{Math.round(scale * 100)}%</span>
          <button onClick={() => handleZoom(0.2)} title="Zoom in">+</button>
          <button onClick={handleFitToWindow} title="Fit to window">Fit</button>
          <button onClick={handleOriginalSize} title="Original size">1:1</button>
        </div>
      </div>

      {/* PDF ドキュメント表示エリア - react-pdf使用 */}
      <div className="pdf-document-container" style={{ 
        height: 'auto', // 高さを自動調整
        overflow: 'visible', // スクロールは親要素に委ねる
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px'
      }}>
        {pdfData ? (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div>🔄 Loading PDF document... ({fileName})</div>}
            error={<div>❌ Failed to load PDF document.</div>}
            onLoadStart={() => console.log('📄 PDF load started for:', fileName)}
            onLoadProgress={({ loaded, total }) => console.log('📊 PDF load progress:', Math.round((loaded / total) * 100) + '%')}
            onSourceError={(error) => console.error('❌ PDF source error:', error)}
            onSourceSuccess={() => console.log('✅ PDF source loaded successfully')}
          >
            {pdfInfo.numPages > 0 && (
              <Page
                pageNumber={pdfInfo.currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={() => console.log('✅ Page rendered:', pdfInfo.currentPage)}
                onLoadError={(error) => console.error('❌ Page render error:', error)}
              />
            )}
          </Document>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            🔄 Loading PDF data from file system...
          </div>
        )}
      </div>
      
      <div className="pdf-open-external">
        <p>💡 <strong>Open with external PDF viewer for full features</strong></p>
        <p className="pdf-hint-small">Use your system's default PDF application for printing, annotations, and more.</p>
      </div>
    </div>
  );
};

export default PDFPreview;