// Web版 Mireru - ブラウザ環境でのファイルエクスプローラー
import { useState, useEffect, useCallback, useRef } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/hljs/scss';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';

import '../renderer/App.css';
import './web-styles.css';
import PDFPreview from '../renderer/components/PDFPreview';
import { 
  webElectronAPI,
  isFileSystemAccessSupported,
  pickDirectory,
  getCurrentPath,
  isDirectorySelected
} from './filesystem-api';

// 言語を登録
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('sql', sql);

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
  isPartial?: boolean;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const TEXT_EXTENSIONS = ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.xml', '.log', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h', '.sh', '.yaml', '.yml'];
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'];
const PDF_EXTENSIONS = ['.pdf'];

const SUPPORTED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...TEXT_EXTENSIONS, ...VIDEO_EXTENSIONS, ...PDF_EXTENSIONS];

// 言語検出のマッピング
const getLanguageFromExtension = (extension: string): string => {
  const ext = extension.toLowerCase();
  const languageMap: { [key: string]: string } = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.rb': 'ruby',
    '.php': 'php',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.h': 'c',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'bash',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.sql': 'sql'
  };
  
  return languageMap[ext] || 'text';
};

function WebImageExplorer() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewContent, setPreviewContent] = useState<FileResult | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [initialPath, setInitialPath] = useState('');
  const [currentScale, setCurrentScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [status, setStatus] = useState('Select a directory to start');
  const [textFontSize, setTextFontSize] = useState(12);
  const [isPreviewPartial, setIsPreviewPartial] = useState(false);
  const [isMetaSidebarVisible, setIsMetaSidebarVisible] = useState(false);
  const [fileTypeCache, setFileTypeCache] = useState(new Map<string, string>());
  const [directorySelected, setDirectorySelected] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // API 互換性チェック
  const [apiSupported, setApiSupported] = useState(false);

  useEffect(() => {
    setApiSupported(isFileSystemAccessSupported());
    if (!isFileSystemAccessSupported()) {
      setStatus('File System Access API not supported. Use Chrome/Edge browser.');
    }
  }, []);

  // 初期化
  const initializeApp = useCallback(async () => {
    try {
      setStatus('Initializing...');
      // Web版では自動でディレクトリ選択を促す
      setStatus('Ready - Please select a directory');
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // ディレクトリピッカーを開く
  const handleDirectorySelect = async () => {
    try {
      const dirPath = await pickDirectory();
      setCurrentPath(dirPath);
      setInitialPath(dirPath);
      setDirectorySelected(true);
      await loadDirectory(dirPath);
      setStatus('Ready');
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        setStatus('Directory selection cancelled');
      } else {
        setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  // ディレクトリロード
  const loadDirectory = async (path: string) => {
    try {
      setStatus('Loading...');
      
      // 状態をリセット
      setPreviewContent(null);
      setIsPreviewPartial(false);
      setCurrentScale(1);
      setTextFontSize(12);
      setSearchQuery('');
      setIsSearchFocused(false);
      setFileTypeCache(new Map());
      
      setCurrentPath(path);
      
      const items = await webElectronAPI.getDirectoryContents(path);
      
      setFiles(items);
      setSelectedIndex(0);
      setStatus(`Ready - ${items.length} items`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // ファイルプレビュー読み込み
  const loadFilePreview = useCallback(async (filePath: string) => {
    try {
      setStatus('Loading file...');
      const result = await webElectronAPI.readFile(filePath);
      setPreviewContent(result);
      setIsPreviewPartial(result.isPartial || false);
      setStatus('Ready');
    } catch (error) {
      setStatus(`Error loading file: ${error instanceof Error ? error.message : String(error)}`);
      setPreviewContent(null);
    }
  }, []);

  // キーボードイベントハンドラ
  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    // 検索フォーカス時の特別処理
    if (isSearchFocused) {
      if (event.key === 'Escape') {
        if (event.shiftKey) {
          setSearchQuery('');
        }
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
        // 以下のファイルナビゲーション処理に続行
      } else {
        return; // 検索フォーカス時は他のキー操作をブロック
      }
    }

    const filteredFiles = files.filter(file =>
      searchQuery === '' || file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredFiles.length === 0) return;

    switch (event.key) {
      case 'n':
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
        break;
      case 'p':
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'G':
        event.preventDefault();
        setSelectedIndex(filteredFiles.length - 1);
        break;
      case 'g':
        if (event.ctrlKey) {
          event.preventDefault();
          setSelectedIndex(0);
        }
        break;
      case 'Enter':
      case 'e':
      case ' ':
        event.preventDefault();
        const selectedFile = filteredFiles[selectedIndex];
        if (selectedFile) {
          if (selectedFile.isDirectory) {
            await loadDirectory(selectedFile.path);
          } else {
            await loadFilePreview(selectedFile.path);
          }
        }
        break;
      case 'Backspace':
        event.preventDefault();
        if (currentPath !== initialPath) {
          const parentPath = await webElectronAPI.getParentDirectory(currentPath);
          await loadDirectory(parentPath);
        }
        break;
      case 'Home':
        event.preventDefault();
        await loadDirectory(initialPath);
        break;
      case '/':
        event.preventDefault();
        setIsSearchFocused(true);
        searchInputRef.current?.focus();
        break;
      case 'Escape':
        if (!isSearchFocused) {
          setPreviewContent(null);
        }
        break;
      case 'i':
      case 'F1':
        event.preventDefault();
        setIsMetaSidebarVisible(prev => !prev);
        break;
    }
  }, [files, selectedIndex, searchQuery, isSearchFocused, currentPath, initialPath, loadDirectory, loadFilePreview]);

  // 初期化
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // キーボードイベントリスナー
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // フィルタリングされたファイル
  const filteredFiles = files.filter(file =>
    searchQuery === '' || file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 選択されたファイル
  const selectedFile = filteredFiles[selectedIndex];

  // ファイルサイズフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // API非対応の場合
  if (!apiSupported) {
    return (
      <div className="app">
        <div className="unsupported-browser">
          <h1>🚫 Browser Not Supported</h1>
          <p>
            Mireru Web requires the <strong>File System Access API</strong> which is currently only supported in:
          </p>
          <ul>
            <li>Google Chrome 86+</li>
            <li>Microsoft Edge 86+</li>
            <li>Brave Browser (experimental)</li>
          </ul>
          <p>
            Please use one of these browsers and make sure you're using HTTPS (or localhost for development).
          </p>
          <div className="browser-links">
            <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
              Download Chrome
            </a>
            <a href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer">
              Download Edge
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ヘッダー */}
      <header className="header">
        <div className="header-content">
          <div className="path-section">
            <span className="path">📁 {currentPath || 'No directory selected'}</span>
          </div>
          <div className="controls">
            {!directorySelected && (
              <button onClick={handleDirectorySelect} className="directory-picker-btn">
                📂 Select Directory
              </button>
            )}
            <button 
              onClick={handleDirectorySelect} 
              className="control-btn"
              title="Select different directory"
            >
              🔄
            </button>
            <button 
              onClick={() => setIsMetaSidebarVisible(!isMetaSidebarVisible)}
              className={`control-btn ${isMetaSidebarVisible ? 'active' : ''}`}
              title="Toggle metadata sidebar (i)"
            >
              ℹ️
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* ファイルリスト */}
        <div className="file-list" ref={fileListRef}>
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="search-input"
            />
          </div>
          
          {!directorySelected ? (
            <div className="no-directory">
              <p>📂 Select a directory to start browsing files</p>
              <button onClick={handleDirectorySelect} className="select-directory-btn">
                Choose Directory
              </button>
            </div>
          ) : (
            <div className="file-items">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.path}
                  className={`file-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={async () => {
                    setSelectedIndex(index);
                    if (file.isDirectory) {
                      await loadDirectory(file.path);
                    } else {
                      await loadFilePreview(file.path);
                    }
                  }}
                >
                  <span className="file-icon">
                    {file.isDirectory ? '📁' : 
                     IMAGE_EXTENSIONS.includes(file.extension) ? '🖼️' :
                     VIDEO_EXTENSIONS.includes(file.extension) ? '🎬' :
                     PDF_EXTENSIONS.includes(file.extension) ? '📋' :
                     TEXT_EXTENSIONS.includes(file.extension) ? '📄' : '📄'}
                  </span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {file.isFile ? formatFileSize(file.size) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* プレビューパネル */}
        <div className="preview-panel" ref={previewRef}>
          {!previewContent ? (
            <div className="preview-placeholder">
              <p>Select a file to preview</p>
              {selectedFile && (
                <div className="file-info">
                  <h3>{selectedFile.name}</h3>
                  <p>Type: {selectedFile.isDirectory ? 'Directory' : 'File'}</p>
                  {selectedFile.isFile && (
                    <>
                      <p>Size: {formatFileSize(selectedFile.size)}</p>
                      <p>Modified: {selectedFile.modified.toLocaleString()}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="preview-content">
              {previewContent.type === 'text' && (
                <div className="text-preview">
                  {isPreviewPartial && (
                    <div className="partial-notice">
                      ⚠️ Large file - showing first 100KB only
                    </div>
                  )}
                  <SyntaxHighlighter
                    language={selectedFile ? getLanguageFromExtension(selectedFile.extension) : 'text'}
                    style={github}
                    showLineNumbers={true}
                    customStyle={{ 
                      fontSize: `${textFontSize}px`,
                      margin: 0,
                      background: 'transparent'
                    }}
                  >
                    {previewContent.content}
                  </SyntaxHighlighter>
                </div>
              )}

              {previewContent.type === 'image' && (
                <div className="image-preview">
                  <img
                    src={previewContent.content}
                    alt={selectedFile?.name}
                    style={{
                      transform: `scale(${currentScale})`,
                      transformOrigin: 'top left'
                    }}
                  />
                </div>
              )}

              {previewContent.type === 'video' && (
                <div className="video-preview">
                  <video controls>
                    <source src={previewContent.content} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {previewContent.type === 'pdf' && selectedFile && (
                <PDFPreview
                  filePath={previewContent.content}
                  fileName={selectedFile.name}
                  scale={currentScale}
                  onScaleChange={setCurrentScale}
                />
              )}

              {previewContent.type === 'hex' && (
                <div className="hex-preview">
                  {isPreviewPartial && (
                    <div className="partial-notice">
                      ⚠️ Large binary file - showing first 20KB only
                    </div>
                  )}
                  <pre className="hex-content">{previewContent.content}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* メタ情報サイドバー */}
        {isMetaSidebarVisible && selectedFile && (
          <div className="meta-sidebar">
            <div className="meta-header">
              <h3>File Information</h3>
              <button
                onClick={() => setIsMetaSidebarVisible(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="meta-content">
              <div className="meta-section">
                <h4>Basic Info</h4>
                <div className="meta-item">
                  <span className="meta-label">Name:</span>
                  <span className="meta-value">{selectedFile.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Type:</span>
                  <span className="meta-value">{selectedFile.isDirectory ? 'Directory' : 'File'}</span>
                </div>
                {selectedFile.isFile && (
                  <>
                    <div className="meta-item">
                      <span className="meta-label">Size:</span>
                      <span className="meta-value">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Extension:</span>
                      <span className="meta-value">{selectedFile.extension || 'None'}</span>
                    </div>
                  </>
                )}
                <div className="meta-item">
                  <span className="meta-label">Modified:</span>
                  <span className="meta-value">{selectedFile.modified.toLocaleString()}</span>
                </div>
              </div>

              <div className="meta-section">
                <h4>Path Info</h4>
                <div className="meta-item">
                  <span className="meta-label">Full Path:</span>
                  <span className="meta-value mono">{selectedFile.path}</span>
                </div>
              </div>

              {previewContent && selectedFile.isFile && (
                <div className="meta-section">
                  <h4>Content Info</h4>
                  {previewContent.type === 'text' && (
                    <>
                      <div className="meta-item">
                        <span className="meta-label">Language:</span>
                        <span className="meta-value">{getLanguageFromExtension(selectedFile.extension)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Lines:</span>
                        <span className="meta-value">{previewContent.content.split('\n').length}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Characters:</span>
                        <span className="meta-value">{previewContent.content.length}</span>
                      </div>
                    </>
                  )}
                  {(previewContent.type === 'image' || previewContent.type === 'video') && (
                    <div className="meta-item">
                      <span className="meta-label">Format:</span>
                      <span className="meta-value">{selectedFile.extension.toUpperCase().slice(1)}</span>
                    </div>
                  )}
                  {previewContent.type === 'pdf' && (
                    <div className="meta-item">
                      <span className="meta-label">Format:</span>
                      <span className="meta-value">PDF Document</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ステータスバー */}
      <footer className="status-bar">
        <span className="status-text">{status}</span>
        {filteredFiles.length > 0 && (
          <span className="file-count">
            {selectedIndex + 1} / {filteredFiles.length} 
            {searchQuery && ` (filtered from ${files.length})`}
          </span>
        )}
      </footer>
    </div>
  );
}

export default WebImageExplorer;