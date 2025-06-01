import { useState, useEffect, useCallback } from 'react';
import './App.css';

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
  type: 'text' | 'image' | 'hex';
  content: string;
  size: number;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

function ImageExplorer() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [status, setStatus] = useState<string>('Initializing...');
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  // 画像ファイルのみをフィルタリング
  const imageFiles = files.filter(file => 
    file.isFile && IMAGE_EXTENSIONS.includes(file.extension.toLowerCase())
  );

  // ディレクトリと画像ファイルを表示用にフィルタリング
  const displayItems = files.filter(file => 
    file.isDirectory || (file.isFile && IMAGE_EXTENSIONS.includes(file.extension.toLowerCase()))
  );

  // 初期化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const homePath = await window.electronAPI.getHomeDirectory();
        setCurrentPath(homePath);
        await loadDirectory(homePath);
        setStatus('Ready');
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };
    initializeApp();
  }, []);

  // ディレクトリの読み込み
  const loadDirectory = async (path: string) => {
    try {
      setStatus('Loading...');
      const items = await window.electronAPI.getDirectoryContents(path);
      setFiles(items);
      setSelectedIndex(0);
      setPreviewContent(null);
      setCurrentPath(path);
      setStatus('Ready');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // ファイルプレビュー
  const previewFile = async (file: FileItem) => {
    if (!file.isFile || !IMAGE_EXTENSIONS.includes(file.extension.toLowerCase())) {
      setPreviewContent(null);
      return;
    }

    try {
      setStatus('Loading preview...');
      const result: FileResult = await window.electronAPI.readFile(file.path);
      if (result.type === 'image') {
        setPreviewContent(result.content);
        setCurrentScale(1);
      } else {
        setPreviewContent(null);
      }
      setStatus(`Preview: ${file.name}`);
    } catch (error) {
      setPreviewContent(null);
      setStatus(`Preview error: ${error.message}`);
    }
  };

  // ファイルサイズの書式設定
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ファイル/ディレクトリを開く
  const openItem = async (item: FileItem) => {
    if (item.isDirectory) {
      await loadDirectory(item.path);
    } else if (item.isFile) {
      await previewFile(item);
    }
  };

  // キーボード操作
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'j':
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(displayItems.length - 1, prev + 1));
        break;
      
      case 'k':
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      
      case 'G':
        event.preventDefault();
        setSelectedIndex(displayItems.length - 1);
        break;
      
      case 'g':
        if (event.ctrlKey) {
          event.preventDefault();
          setSelectedIndex(0);
        }
        break;
      
      case ' ':
        event.preventDefault();
        if (displayItems[selectedIndex]) {
          if (displayItems[selectedIndex].isFile) {
            previewFile(displayItems[selectedIndex]);
          }
        }
        break;
      
      case 'Enter':
        event.preventDefault();
        if (displayItems[selectedIndex]) {
          openItem(displayItems[selectedIndex]);
        }
        break;
      
      case 'Backspace':
        event.preventDefault();
        goUp();
        break;
      
      case 'Home':
        event.preventDefault();
        goHome();
        break;
      
      case '+':
      case '=':
        event.preventDefault();
        setCurrentScale(prev => Math.min(5, prev * 1.2));
        break;
      
      case '-':
        event.preventDefault();
        setCurrentScale(prev => Math.max(0.1, prev * 0.8));
        break;
      
      case 'f':
        event.preventDefault();
        fitToWindow();
        break;
      
      case 'o':
        event.preventDefault();
        setCurrentScale(1);
        break;
      
      case 'Escape':
        event.preventDefault();
        setPreviewContent(null);
        break;
    }
  }, [displayItems, selectedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // ナビゲーション
  const goHome = async () => {
    try {
      const homePath = await window.electronAPI.getHomeDirectory();
      await loadDirectory(homePath);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const goUp = async () => {
    try {
      const parentPath = await window.electronAPI.getParentDirectory(currentPath);
      if (parentPath) {
        await loadDirectory(parentPath);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // ウィンドウにフィット
  const fitToWindow = () => {
    // 実装は後で追加
    setCurrentScale(1);
  };

  // 選択されたファイルのプレビューを自動表示
  useEffect(() => {
    if (displayItems[selectedIndex] && displayItems[selectedIndex].isFile) {
      previewFile(displayItems[selectedIndex]);
    } else {
      setPreviewContent(null);
    }
  }, [selectedIndex, displayItems]);

  return (
    <div className="image-explorer">
      {/* ヘッダー */}
      <header className="header">
        <div className="path-bar">
          <button onClick={goHome} className="path-btn" title="Home (Home)">
            🏠
          </button>
          <button onClick={goUp} className="path-btn" title="Go up (Backspace)">
            ⬆️
          </button>
          <span className="current-path">{currentPath}</span>
        </div>
        <div className="controls">
          <span className="help-text">Image File Explorer</span>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        {/* ファイル・ディレクトリリスト */}
        <div className="file-list-container">
          <div className="file-list">
            {displayItems.map((item, index) => (
              <div
                key={item.path}
                className={`file-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => setSelectedIndex(index)}
                onDoubleClick={() => openItem(item)}
              >
                <span className="file-icon">
                  {item.isDirectory ? '📁' : '🖼️'}
                </span>
                <span className="file-name">{item.name}</span>
                <span className="file-size">
                  {item.isDirectory ? '' : formatFileSize(item.size)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* プレビューパネル */}
        <div className="preview-container">
          <div className="preview-panel">
            {previewContent ? (
              <img
                src={previewContent}
                alt="Preview"
                className="preview-image"
                style={{ transform: `scale(${currentScale})` }}
              />
            ) : (
              <div className="preview-placeholder">
                <h3>Mireru - Image Explorer</h3>
                <p>Select an image file to preview</p>
                <div className="key-hints">
                  <div><kbd>j/k</kbd> Navigate up/down</div>
                  <div><kbd>Enter</kbd> Open folder/image</div>
                  <div><kbd>Space</kbd> Preview image</div>
                  <div><kbd>+/-</kbd> Zoom in/out</div>
                  <div><kbd>f</kbd> Fit to window</div>
                  <div><kbd>o</kbd> Original size</div>
                  <div><kbd>Backspace</kbd> Go up</div>
                  <div><kbd>Home</kbd> Go home</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ステータスバー */}
      <footer className="status-bar">
        <span>{status}</span>
        <span>Folders: {displayItems.filter(item => item.isDirectory).length} | Images: {imageFiles.length}</span>
      </footer>
    </div>
  );
}

export default function App() {
  return <ImageExplorer />;
}
