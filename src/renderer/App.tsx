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
import './App.css';
import PDFPreview from './components/PDFPreview';

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

type ViewMode = 'auto' | 'text' | 'binary';

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
    '.fish': 'fish',
    '.ps1': 'powershell',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.ini': 'ini',
    '.cfg': 'ini',
    '.conf': 'ini',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.sql': 'sql',
    '.r': 'r',
    '.m': 'matlab',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.clj': 'clojure',
    '.hs': 'haskell',
    '.elm': 'elm',
    '.lua': 'lua',
    '.perl': 'perl',
    '.pl': 'perl',
    '.vim': 'vim',
    '.dockerfile': 'dockerfile',
    '.makefile': 'makefile',
    '.cmake': 'cmake',
    '.log': 'accesslog',
  };
  
  return languageMap[ext] || 'text';
};

// SVGアイコン生成関数
const generateSVGIcon = (type: string, size: number = 16): string => {
  const svgStart = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  const svgEnd = '</svg>';
  
  switch (type) {
    case 'folder':
      return `${svgStart}
        <path d="M2 3c0-.6.4-1 1-1h4l2 2h6c.6 0 1 .4 1 1v8c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3z" 
              fill="#54aeff" stroke="#0066cc" stroke-width="0.5"/>
      ${svgEnd}`;
      
    case 'image':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#90EE90" stroke="#228B22" stroke-width="0.5" rx="1"/>
        <circle cx="5" cy="6" r="1.5" fill="#228B22"/>
        <path d="M3 11l3-3 2 2 4-4 2 2v3z" fill="#228B22"/>
      ${svgEnd}`;
      
    case 'text':
      return `${svgStart}
        <rect x="2" y="1" width="10" height="14" fill="#f8f9fa" stroke="#666" stroke-width="0.5" rx="1"/>
        <path d="M4 3h6M4 6h6M4 9h4M4 12h5" stroke="#333" stroke-width="0.8" stroke-linecap="round"/>
      ${svgEnd}`;
      
    case 'video':
      return `${svgStart}
        <rect x="1" y="3" width="14" height="10" fill="#ff6b6b" stroke="#cc0000" stroke-width="0.5" rx="1"/>
        <path d="M6 6l4 2-4 2z" fill="white"/>
      ${svgEnd}`;
      
    case 'pdf':
      return `${svgStart}
        <rect x="2" y="1" width="10" height="14" fill="#ff4757" stroke="#cc0000" stroke-width="0.5" rx="1"/>
        <text x="8" y="9" text-anchor="middle" fill="white" font-size="6" font-weight="bold">PDF</text>
      ${svgEnd}`;
      
    case 'binary':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#6c757d" stroke="#495057" stroke-width="0.5" rx="1"/>
        <text x="8" y="6" text-anchor="middle" fill="white" font-size="3" font-family="monospace">01</text>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="3" font-family="monospace">10</text>
      ${svgEnd}`;
      
    // 言語固有アイコン
    case 'javascript':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#f7df1e" stroke="#e6c200" stroke-width="0.5" rx="2"/>
        <text x="8" y="10" text-anchor="middle" fill="#323330" font-size="7" font-weight="bold">JS</text>
      ${svgEnd}`;
      
    case 'typescript':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#3178c6" stroke="#2c5aa0" stroke-width="0.5" rx="2"/>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="7" font-weight="bold">TS</text>
      ${svgEnd}`;
      
    case 'python':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#3776ab" stroke="#2d5a87" stroke-width="0.5" rx="2"/>
        <circle cx="6" cy="6" r="2" fill="#ffd43b"/>
        <circle cx="10" cy="10" r="2" fill="#4b8bbe"/>
      ${svgEnd}`;
      
    case 'ruby':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#cc342d" stroke="#a02622" stroke-width="0.5" rx="2"/>
        <polygon points="8,4 11,7 8,12 5,7" fill="#fff" stroke="#cc342d" stroke-width="0.3"/>
      ${svgEnd}`;
      
    case 'java':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#ed8b00" stroke="#c77000" stroke-width="0.5" rx="2"/>
        <circle cx="8" cy="8" r="3" fill="#5382a1"/>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="5" font-weight="bold">J</text>
      ${svgEnd}`;
      
    case 'go':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#00add8" stroke="#0087a8" stroke-width="0.5" rx="2"/>
        <text x="8" y="9" text-anchor="middle" fill="white" font-size="6" font-weight="bold">GO</text>
      ${svgEnd}`;
      
    case 'rust':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#ce422b" stroke="#a03220" stroke-width="0.5" rx="2"/>
        <polygon points="8,5 10,7 8,11 6,7" fill="#fff"/>
      ${svgEnd}`;
      
    case 'php':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#777bb4" stroke="#6b6ca3" stroke-width="0.5" rx="2"/>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="6" font-weight="bold">PHP</text>
      ${svgEnd}`;
      
    case 'html':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#e34c26" stroke="#c23616" stroke-width="0.5" rx="2"/>
        <text x="8" y="6" text-anchor="middle" fill="white" font-size="4" font-weight="bold">&lt;</text>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="4" font-weight="bold">&gt;</text>
      ${svgEnd}`;
      
    case 'css':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#1572b6" stroke="#0e5a8a" stroke-width="0.5" rx="2"/>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="6" font-weight="bold">CSS</text>
      ${svgEnd}`;
      
    case 'json':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#292929" stroke="#1a1a1a" stroke-width="0.5" rx="2"/>
        <text x="5" y="8" fill="#ffd700" font-size="6">{</text>
        <text x="11" y="8" fill="#ffd700" font-size="6">}</text>
      ${svgEnd}`;
      
    case 'markdown':
      return `${svgStart}
        <rect x="2" y="2" width="12" height="12" fill="#083fa1" stroke="#062d7a" stroke-width="0.5" rx="2"/>
        <text x="8" y="10" text-anchor="middle" fill="white" font-size="7" font-weight="bold">M</text>
      ${svgEnd}`;
      
    case 'home':
      return `${svgStart}
        <path d="M8 2L2 7v7h3v-4h2v4h3V7l-6-5z" fill="#4a5568" stroke="#2d3748" stroke-width="0.5"/>
        <rect x="6" y="6" width="4" height="4" fill="#4a5568"/>
      ${svgEnd}`;
      
    case 'up':
      return `${svgStart}
        <path d="M8 3l5 5H10v5H6V8H3l5-5z" fill="#4a5568" stroke="#2d3748" stroke-width="0.5"/>
      ${svgEnd}`;
      
    default:
      return `${svgStart}
        <rect x="2" y="1" width="10" height="14" fill="#e9ecef" stroke="#adb5bd" stroke-width="0.5" rx="1"/>
        <text x="8" y="9" text-anchor="middle" fill="#495057" font-size="8">?</text>
      ${svgEnd}`;
  }
};

// ファイルアイコンコンポーネント（未定義拡張子の非同期判定対応）
function FileIcon({ 
  item, 
  getFileIcon, 
  detectFileType 
}: { 
  item: FileItem; 
  getFileIcon: (extension: string, filePath?: string) => string;
  detectFileType: (filePath: string) => Promise<'text' | 'binary'>;
}) {
  const [iconHtml, setIconHtml] = useState<string>('');
  
  useEffect(() => {
    const updateIcon = async () => {
      if (item.isDirectory) {
        setIconHtml(generateSVGIcon('folder'));
        return;
      }
      
      // 定義済み拡張子は即座に表示
      if (SUPPORTED_EXTENSIONS.includes(item.extension.toLowerCase())) {
        setIconHtml(getFileIcon(item.extension, item.path));
        return;
      }
      
      // 未定義拡張子は非同期で判定
      try {
        await detectFileType(item.path);
        setIconHtml(getFileIcon(item.extension, item.path));
      } catch (error) {
        setIconHtml(generateSVGIcon('binary'));
      }
    };
    
    updateIcon();
  }, [item.path, item.extension, item.isDirectory, viewMode]);
  
  return (
    <span 
      className="file-icon"
      dangerouslySetInnerHTML={{ __html: iconHtml }}
    />
  );
}

function ImageExplorer() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [initialPath, setInitialPath] = useState<string>(''); // 起動時のディレクトリを保存
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [textFontSize, setTextFontSize] = useState<number>(12);
  const [status, setStatus] = useState<string>('Initializing...');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewPartial, setIsPreviewPartial] = useState<boolean>(false);
  
  // 大きなファイル用の遅延レンダリング状態
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  const [showSyntaxHighlight, setShowSyntaxHighlight] = useState<boolean>(true);
  const [syntaxHighlightTimeout, setSyntaxHighlightTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // ファイル読み込み状態管理（プレビューキャンセル用）
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [loadingAbortController, setLoadingAbortController] = useState<AbortController | null>(null);
  
  // プレビューパネルのスクロール制御用ref
  const previewPanelRef = useRef<HTMLDivElement>(null);
  
  // ファイルリストのスクロール制御用ref
  const fileListRef = useRef<HTMLDivElement>(null);
  
  // ファイル判定結果のキャッシュ
  const [fileTypeCache, setFileTypeCache] = useState<Map<string, 'text' | 'binary'>>(new Map());
  
  // ディレクトリキャッシュ（最大10個のディレクトリをキャッシュ）
  const [directoryCache, setDirectoryCache] = useState<Map<string, FileItem[]>>(new Map());
  
  // 検索機能
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // メタ情報サイドバー
  const [showMetadataSidebar, setShowMetadataSidebar] = useState<boolean>(false);

  // サイドバー幅制御
  const [fileListWidth, setFileListWidth] = useState<number>(300);
  const [metadataWidth, setMetadataWidth] = useState<number>(300);
  const [isResizingFileList, setIsResizingFileList] = useState<boolean>(false);
  const [isResizingMetadata, setIsResizingMetadata] = useState<boolean>(false);

  // Binary/Text表示モード切り替え
  const [viewMode, setViewMode] = useState<ViewMode>('auto');


  // ディレクトリとすべてのファイルを表示（バイナリファイルも含む）+ 検索フィルタリング
  const displayItems = files.filter(file => {
    if (!(file.isDirectory || file.isFile)) return false;
    
    // 検索クエリが空の場合は全て表示
    if (!searchQuery.trim()) return true;
    
    // ファイル名での部分一致検索（大文字小文字区別なし）
    return file.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 初期化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const startupPath = await window.electronAPI.getInitialDirectory();
        setInitialPath(startupPath); // 起動時のディレクトリを保存
        setCurrentPath(startupPath);
        await loadDirectory(startupPath);
        setStatus('Ready');
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    initializeApp();
  }, []);

  // ディレクトリの読み込み
  const loadDirectory = async (path: string) => {
    try {
      setStatus('Loading...');
      
      // 状態をリセット（パフォーマンス向上のため）
      setPreviewContent(null);
      setIsPreviewPartial(false);
      setCurrentScale(1);
      setTextFontSize(12);
      setSearchQuery('');
      setIsSearchFocused(false);
      setFileTypeCache(new Map());
      
      // パスを即座に更新（UIの応答性向上）
      setCurrentPath(path);
      
      // キャッシュから確認
      if (directoryCache.has(path)) {
        const cachedItems = directoryCache.get(path)!;
        setFiles(cachedItems);
        setSelectedIndex(0);
        setStatus(`Ready - ${cachedItems.length} items (cached)`);
        return;
      }
      
      // ディレクトリ内容を非同期で取得
      const items = await window.electronAPI.getDirectoryContents(path);
      
      // キャッシュに追加（最大10個まで）
      setDirectoryCache(prevCache => {
        const newCache = new Map(prevCache);
        
        // キャッシュサイズ制限
        if (newCache.size >= 10) {
          // 最も古いエントリを削除（Mapの最初のキー）
          const firstKey = newCache.keys().next().value;
          if (firstKey !== undefined) {
            newCache.delete(firstKey);
          }
        }
        
        newCache.set(path, items);
        return newCache;
      });
      
      // 大きなディレクトリの場合は遅延表示でUIブロックを防ぐ
      if (items.length > 500) {
        setStatus(`Loading ${items.length} items...`);
        
        // UIの更新を次のフレームに遅延
        setTimeout(() => {
          setFiles(items);
          setSelectedIndex(0);
          setStatus(`Ready - ${items.length} items`);
        }, 0);
      } else {
        setFiles(items);
        setSelectedIndex(0);
        setStatus(`Ready - ${items.length} items`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // ファイルプレビュー
  const previewFile = useCallback(async (file: FileItem) => {
    if (!file.isFile) {
      setPreviewContent(null);
      setIsPreviewPartial(false);
      setIsLargeFile(false);
      setShowSyntaxHighlight(true);
      setIsLoadingFile(false);
      // 既存のタイムアウトをクリア
      if (syntaxHighlightTimeout) {
        clearTimeout(syntaxHighlightTimeout);
        setSyntaxHighlightTimeout(null);
      }
      // 既存の読み込みをキャンセル
      if (loadingAbortController) {
        loadingAbortController.abort();
        setLoadingAbortController(null);
      }
      return;
    }

    try {
      // 既存の読み込みをキャンセル
      if (loadingAbortController) {
        loadingAbortController.abort();
      }
      
      // 新しいAbortControllerを作成
      const abortController = new AbortController();
      setLoadingAbortController(abortController);
      setIsLoadingFile(true);
      setStatus('Loading preview...');
      
      // View mode indicator for status messages
      const viewModeText = viewMode !== 'auto' ? ` [${viewMode.toUpperCase()}]` : '';
      
      // 既存のタイムアウトをクリア
      if (syntaxHighlightTimeout) {
        clearTimeout(syntaxHighlightTimeout);
        setSyntaxHighlightTimeout(null);
      }
      
      const result: FileResult = await window.electronAPI.readFile(file.path, viewMode);
      
      // キャンセルされた場合は何もしない
      if (abortController.signal.aborted) {
        return;
      }
      
      setPreviewContent(result.content);
      setIsPreviewPartial(result.isPartial || false);
      setIsLoadingFile(false);
      setLoadingAbortController(null);
      
      if (result.type === 'image') {
        setCurrentScale(1);
      }
      
      // テキストファイルの場合、サイズに基づいて遅延シンタックスハイライトを判定
      const ext = file.extension.toLowerCase();
      if (TEXT_EXTENSIONS.includes(ext) && result.type === 'text') {
        const contentSize = result.content.length;
        const lineCount = result.content.split('\n').length;
        
        // 50KB以上または1000行以上の場合は大きなファイルとして扱う
        if (contentSize > 50000 || lineCount > 1000) {
          setIsLargeFile(true);
          setShowSyntaxHighlight(false);
          
          // 500ms後にシンタックスハイライトを有効化
          const timeout = setTimeout(() => {
            setShowSyntaxHighlight(true);
            setStatus(`Preview: ${file.name} (syntax highlighting applied)${viewModeText}`);
          }, 500);
          
          setSyntaxHighlightTimeout(timeout);
          setStatus(`Preview: ${file.name} (large file - applying syntax highlighting...)${viewModeText}`);
        } else {
          setIsLargeFile(false);
          setShowSyntaxHighlight(true);
        }
      } else {
        setIsLargeFile(false);
        setShowSyntaxHighlight(true);
      }
      
      // 部分読み込みの場合はステータスに表示
      if (result.isPartial) {
        setStatus(`Preview: ${file.name} (partial - showing first ${(result.size / (1024 * 1024)).toFixed(1)}MB)${viewModeText}`);
      } else if (!isLargeFile || result.type !== 'text') {
        setStatus(`Preview: ${file.name}${viewModeText}`);
      }
    } catch (error) {
      setPreviewContent(null);
      setIsPreviewPartial(false);
      setIsLargeFile(false);
      setShowSyntaxHighlight(true);
      setIsLoadingFile(false);
      setLoadingAbortController(null);
      if (syntaxHighlightTimeout) {
        clearTimeout(syntaxHighlightTimeout);
        setSyntaxHighlightTimeout(null);
      }
      setStatus(`Preview error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [syntaxHighlightTimeout, loadingAbortController, viewMode]);

  // ファイルアイコンの取得
  const getFileIcon = (extension: string, filePath?: string): string => {
    const ext = extension.toLowerCase();
    
    // 画像・動画・PDF
    if (IMAGE_EXTENSIONS.includes(ext)) return generateSVGIcon('image');
    if (VIDEO_EXTENSIONS.includes(ext)) return generateSVGIcon('video');
    if (PDF_EXTENSIONS.includes(ext)) return generateSVGIcon('pdf');
    
    // 言語固有アイコン
    if (['.js', '.jsx'].includes(ext)) return generateSVGIcon('javascript');
    if (['.ts', '.tsx'].includes(ext)) return generateSVGIcon('typescript');
    if (['.py'].includes(ext)) return generateSVGIcon('python');
    if (['.rb'].includes(ext)) return generateSVGIcon('ruby');
    if (['.java'].includes(ext)) return generateSVGIcon('java');
    if (['.go'].includes(ext)) return generateSVGIcon('go');
    if (['.rs'].includes(ext)) return generateSVGIcon('rust');
    if (['.php'].includes(ext)) return generateSVGIcon('php');
    if (['.html', '.htm'].includes(ext)) return generateSVGIcon('html');
    if (['.css', '.scss', '.sass', '.less'].includes(ext)) return generateSVGIcon('css');
    if (['.json'].includes(ext)) return generateSVGIcon('json');
    if (['.md', '.markdown'].includes(ext)) return generateSVGIcon('markdown');
    
    // その他の定義済みテキストファイル
    if (TEXT_EXTENSIONS.includes(ext)) return generateSVGIcon('text');
    
    // 未定義拡張子 - キャッシュから判定結果を取得
    if (filePath && fileTypeCache.has(filePath)) {
      const fileType = fileTypeCache.get(filePath);
      return fileType === 'text' ? generateSVGIcon('text') : generateSVGIcon('binary');
    }
    
    // デフォルト（判定前）
    return generateSVGIcon('binary');
  };

  // ファイルサイズの書式設定
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ファイルパスをクリップボードにコピー
  const copyCurrentFilePath = async () => {
    if (!displayItems[selectedIndex]) return;
    
    const currentItem = displayItems[selectedIndex];
    const pathToCopy = currentItem.path;
    
    try {
      const success = await window.electronAPI.copyToClipboard(pathToCopy);
      if (success) {
        setStatus(`Copied: ${pathToCopy}`);
        // 2秒後にステータスを元に戻す
        setTimeout(() => setStatus('Ready'), 2000);
      } else {
        setStatus('Failed to copy to clipboard');
      }
    } catch (error) {
      setStatus('Failed to copy to clipboard');
    }
  };

  // 検索をクリア
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedIndex(0);
  };

  // Binary/Text表示モードを切り替え
  const cycleViewMode = () => {
    setViewMode(prev => {
      const modes: ViewMode[] = ['auto', 'text', 'binary'];
      const currentIndex = modes.indexOf(prev);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      
      // ファイルタイプキャッシュをクリア（表示モードが変わったため）
      setFileTypeCache(new Map());
      
      // 現在選択されているファイルを再プレビュー
      if (displayItems[selectedIndex] && displayItems[selectedIndex].isFile) {
        setTimeout(() => previewFile(displayItems[selectedIndex]), 0);
      }
      
      return nextMode;
    });
  };

  // 選択項目をビューに表示する
  const scrollSelectedItemIntoView = useCallback((index: number) => {
    if (!fileListRef.current) return;
    
    const fileListElement = fileListRef.current;
    const selectedElement = fileListElement.children[index] as HTMLElement;
    
    if (!selectedElement) return;
    
    const containerRect = fileListElement.getBoundingClientRect();
    const selectedRect = selectedElement.getBoundingClientRect();
    
    // 選択項目がコンテナの上部より上にある場合
    if (selectedRect.top < containerRect.top) {
      selectedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    // 選択項目がコンテナの下部より下にある場合
    else if (selectedRect.bottom > containerRect.bottom) {
      selectedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }, []);

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
    // 検索ボックスにフォーカスがある場合は、ほとんどのキーバインドを無効化
    if (isSearchFocused) {
      // 検索フォーカス中でも有効にするキー
      if (event.key === 'Escape') {
        event.preventDefault();
        // Shiftキーと一緒に押された場合は検索をクリア
        if (event.shiftKey && searchQuery) {
          clearSearch();
        }
        searchInputRef.current?.blur();
        return;
      }
      // その他のキーは検索入力に任せる
      return;
    }
    
    // Ctrl+Shift+C でファイルパスをコピー
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      copyCurrentFilePath();
      return;
    }
    
    // Ctrl+Plus でテキストサイズ拡大
    if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      setTextFontSize(prev => Math.min(24, prev + 1));
      return;
    }
    
    // Ctrl+Minus でテキストサイズ縮小
    if (event.ctrlKey && event.key === '-') {
      event.preventDefault();
      setTextFontSize(prev => Math.max(8, prev - 1));
      return;
    }
    
    // Ctrl+0 でテキストサイズリセット
    if (event.ctrlKey && event.key === '0') {
      event.preventDefault();
      setTextFontSize(12);
      return;
    }
    
    // Ctrl+Cは標準のコピー動作（選択範囲）に任せる
    if (event.ctrlKey && event.key === 'c') {
      return; // デフォルト動作を許可
    }
    
    switch (event.key) {
      case 'n':
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(displayItems.length - 1, prev + 1));
        break;
      
      case 'p':
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
      
      case 'r':
        event.preventDefault();
        // リロード - 現在選択されているファイルを再プレビュー
        if (displayItems[selectedIndex] && displayItems[selectedIndex].isFile) {
          previewFile(displayItems[selectedIndex]);
        }
        break;
      
      case 'e':
        event.preventDefault();
        // ディレクトリ展開（Enterと同じ動作）
        if (displayItems[selectedIndex]) {
          openItem(displayItems[selectedIndex]);
        }
        break;
      
      // プレビューパネルのスクロール（vim風hjkl）
      case 'h':
        event.preventDefault();
        scrollPreviewPanel(-17, 0); // 左スクロール
        break;
      
      case 'j':
        event.preventDefault();
        scrollPreviewPanel(0, 17); // 下スクロール
        break;
      
      case 'k':
        event.preventDefault();
        scrollPreviewPanel(0, -17); // 上スクロール
        break;
      
      case 'l':
        event.preventDefault();
        scrollPreviewPanel(17, 0); // 右スクロール
        break;
      
      // 大きなスクロール（HJKL）
      case 'H':
        event.preventDefault();
        scrollPreviewPanel(-17 * 10, 0); // 大きく左スクロール
        break;
      
      case 'J':
        event.preventDefault();
        scrollPreviewPanel(0, 17 * 10); // 大きく下スクロール
        break;
      
      case 'K':
        event.preventDefault();
        scrollPreviewPanel(0, -17 * 10); // 大きく上スクロール
        break;
      
      case 'L':
        event.preventDefault();
        scrollPreviewPanel(17 * 10, 0); // 大きく右スクロール
        break;
      
      // 検索機能
      case '/':
        event.preventDefault();
        searchInputRef.current?.focus();
        break;
      
      case 'i':
      case 'F1':
        event.preventDefault();
        setShowMetadataSidebar(prev => !prev);
        break;

      case 'b':
        event.preventDefault();
        cycleViewMode();
        break;

      case 'Escape':
        event.preventDefault();
        if (searchQuery) {
          clearSearch();
        } else if (isLoadingFile && loadingAbortController) {
          // ファイル読み込み中の場合はキャンセル
          loadingAbortController.abort();
          setLoadingAbortController(null);
          setIsLoadingFile(false);
          setStatus('Preview cancelled');
        } else {
          setPreviewContent(null);
          setIsPreviewPartial(false);
        }
        break;
    }
  }, [displayItems, selectedIndex, copyCurrentFilePath, clearSearch, searchQuery, isSearchFocused, textFontSize, showMetadataSidebar, isLoadingFile, loadingAbortController, cycleViewMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // リサイズハンドラー
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingFileList) {
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setFileListWidth(newWidth);
    }
    if (isResizingMetadata) {
      const newWidth = Math.max(250, Math.min(500, window.innerWidth - e.clientX));
      setMetadataWidth(newWidth);
    }
  }, [isResizingFileList, isResizingMetadata]);

  const handleMouseUp = useCallback(() => {
    setIsResizingFileList(false);
    setIsResizingMetadata(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizingFileList || isResizingMetadata) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingFileList, isResizingMetadata, handleMouseMove, handleMouseUp]);

  // ナビゲーション - 起動時のディレクトリに戻る
  const goHome = async () => {
    try {
      if (initialPath) {
        await loadDirectory(initialPath);
      } else {
        // 初期パスが設定されていない場合はgetInitialDirectoryを再実行
        const startupPath = await window.electronAPI.getInitialDirectory();
        setInitialPath(startupPath);
        await loadDirectory(startupPath);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const goUp = async () => {
    try {
      const parentPath = await window.electronAPI.getParentDirectory(currentPath);
      if (parentPath) {
        await loadDirectory(parentPath);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // ウィンドウにフィット
  const fitToWindow = () => {
    // 実装は後で追加
    setCurrentScale(1);
  };

  // プレビューパネルのスクロール制御
  const scrollPreviewPanel = (deltaX: number, deltaY: number) => {
    if (!previewPanelRef.current) return;
    
    const scrollContainer = previewPanelRef.current.querySelector('.preview-content') as HTMLElement;
    if (!scrollContainer) return;
    
    // 実際にスクロールする要素を特定
    let targetElement: HTMLElement | null = null;
    
    // シンタックスハイライター
    const syntaxElement = scrollContainer.querySelector('.preview-text-syntax') as HTMLElement;
    if (syntaxElement) {
      targetElement = syntaxElement;
    }
    
    // 画像の場合はpreview-content自体
    if (!targetElement && scrollContainer.querySelector('.preview-image')) {
      targetElement = scrollContainer;
    }
    
    // hexダンプの場合
    const hexElement = scrollContainer.querySelector('.preview-hex') as HTMLElement;
    if (!targetElement && hexElement) {
      targetElement = hexElement;
    }
    
    // PDFプレビューの場合 - PDF Documentコンテナ内を直接スクロール
    const pdfElement = scrollContainer.querySelector('.pdf-document-container') as HTMLElement;
    if (!targetElement && pdfElement) {
      // PDFの場合は親のscrollContainerをスクロールする
      targetElement = scrollContainer;
    }
    
    // デフォルトはpreview-content
    if (!targetElement) {
      targetElement = scrollContainer;
    }
    
    if (targetElement) {
      targetElement.scrollTop += deltaY;
      targetElement.scrollLeft += deltaX;
    }
  };

  // 未定義拡張子ファイルの型判定（非同期、キャッシュ付き）
  const detectFileType = async (filePath: string): Promise<'text' | 'binary'> => {
    // キャッシュから取得
    if (fileTypeCache.has(filePath)) {
      return fileTypeCache.get(filePath)!;
    }
    
    try {
      // メインプロセスで判定
      const result = await window.electronAPI.readFile(filePath, viewMode);
      const detectedType = result.type === 'text' ? 'text' : 'binary';
      
      // キャッシュに保存
      setFileTypeCache(prev => new Map(prev.set(filePath, detectedType)));
      
      return detectedType;
    } catch (error) {
      // エラーの場合はバイナリとして扱う
      setFileTypeCache(prev => new Map(prev.set(filePath, 'binary')));
      return 'binary';
    }
  };

  // メタ情報サイドバーのレンダリング
  const renderMetadataSidebar = () => {
    if (!displayItems[selectedIndex]) return null;
    
    const item = displayItems[selectedIndex];
    const ext = item.extension.toLowerCase();
    
    return (
      <div className="metadata-sidebar" style={{ width: `${metadataWidth}px` }}>
        {/* メタデータサイドバーリサイザー */}
        <div 
          className="resize-handle resize-handle-left"
          onMouseDown={() => setIsResizingMetadata(true)}
        />
        <div className="metadata-header">
          <h3>File Information</h3>
          <button 
            className="metadata-close-btn"
            onClick={() => setShowMetadataSidebar(false)}
            title="Close metadata (i)"
          >
            ✕
          </button>
        </div>
        
        <div className="metadata-content">
          <div className="metadata-section">
            <h4>Basic Info</h4>
            <div className="metadata-item">
              <span className="metadata-label">Name:</span>
              <span className="metadata-value">{item.name}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Type:</span>
              <span className="metadata-value">
                {item.isDirectory ? 'Directory' : 'File'}
              </span>
            </div>
            {!item.isDirectory && (
              <>
                <div className="metadata-item">
                  <span className="metadata-label">Size:</span>
                  <span className="metadata-value">{formatFileSize(item.size)}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Extension:</span>
                  <span className="metadata-value">{ext || 'None'}</span>
                </div>
              </>
            )}
            <div className="metadata-item">
              <span className="metadata-label">Modified:</span>
              <span className="metadata-value">
                {new Date(item.modified).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="metadata-section">
            <h4>Path Info</h4>
            <div className="metadata-item">
              <span className="metadata-label">Full Path:</span>
              <span className="metadata-value metadata-path">{item.path}</span>
            </div>
          </div>
          
          {!item.isDirectory && previewContent && (
            <div className="metadata-section">
              <h4>Content Info</h4>
              {TEXT_EXTENSIONS.includes(ext) && (
                <>
                  <div className="metadata-item">
                    <span className="metadata-label">Lines:</span>
                    <span className="metadata-value">
                      {previewContent.split('\n').length.toLocaleString()}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Characters:</span>
                    <span className="metadata-value">
                      {previewContent.length.toLocaleString()}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Bytes:</span>
                    <span className="metadata-value">
                      {new Blob([previewContent]).size.toLocaleString()}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Language:</span>
                    <span className="metadata-value">
                      {getLanguageFromExtension(ext)}
                    </span>
                  </div>
                </>
              )}
              {IMAGE_EXTENSIONS.includes(ext) && (
                <div className="metadata-item">
                  <span className="metadata-label">Format:</span>
                  <span className="metadata-value">Image ({ext.substring(1).toUpperCase()})</span>
                </div>
              )}
              {VIDEO_EXTENSIONS.includes(ext) && (
                <div className="metadata-item">
                  <span className="metadata-label">Format:</span>
                  <span className="metadata-value">Video ({ext.substring(1).toUpperCase()})</span>
                </div>
              )}
              {PDF_EXTENSIONS.includes(ext) && (
                <div className="metadata-item">
                  <span className="metadata-label">Format:</span>
                  <span className="metadata-value">PDF Document</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // プレビューコンテンツのレンダリング
  const renderPreviewContent = () => {
    if (!previewContent || !displayItems[selectedIndex]) return null;
    
    const file = displayItems[selectedIndex];
    const ext = file.extension.toLowerCase();
    
    if (IMAGE_EXTENSIONS.includes(ext)) {
      return (
        <img
          src={previewContent}
          alt="Preview"
          className="preview-image"
          style={{ transform: `scale(${currentScale})` }}
        />
      );
    } else if (TEXT_EXTENSIONS.includes(ext)) {
      const language = getLanguageFromExtension(ext);
      
      // 大きなファイルでシンタックスハイライトが無効の場合は、プレーンテキストで表示
      if (isLargeFile && !showSyntaxHighlight) {
        return (
          <div className="preview-text-container">
            <pre 
              className="preview-text-plain"
              style={{
                background: '#ffffff',
                padding: '16px',
                margin: '0',
                borderRadius: '0',
                fontSize: `${textFontSize}px`,
                lineHeight: '1.4',
                height: '100%',
                maxHeight: 'none',
                overflow: 'auto',
                border: 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                color: '#24292e'
              }}
            >
              {previewContent}
            </pre>
          </div>
        );
      }
      
      // 通常のシンタックスハイライト表示
      return (
        <div className="preview-text-container">
          <SyntaxHighlighter
            language={language}
            style={github}
            className="preview-text-syntax"
            showLineNumbers={true}
            lineNumberStyle={{ color: '#999', fontSize: '11px', paddingRight: '8px' }}
            customStyle={{
              background: '#ffffff',
              padding: '0',
              margin: '0',
              borderRadius: '0',
              fontSize: `${textFontSize}px`,
              lineHeight: '1.4',
              height: '100%',
              maxHeight: 'none',
              overflow: 'auto',
              border: 'none'
            }}
          >
            {previewContent}
          </SyntaxHighlighter>
        </div>
      );
    } else if (VIDEO_EXTENSIONS.includes(ext)) {
      return (
        <video
          src={previewContent}
          controls
          autoPlay={false}
          className="preview-video"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          onError={(e) => {
            console.error('Video playback error:', e);
            setStatus('Video playback error');
          }}
        />
      );
    } else if (PDF_EXTENSIONS.includes(ext)) {
      return (
        <PDFPreview
          filePath={file.path}
          fileName={file.name}
          scale={currentScale}
          onScaleChange={setCurrentScale}
        />
      );
    } else {
      // Hex dump for binary files
      return (
        <pre className="preview-hex" style={{ fontSize: `${textFontSize}px` }}>
          {previewContent}
        </pre>
      );
    }
  };

  // 選択されたファイルのプレビューを自動表示
  useEffect(() => {
    if (displayItems[selectedIndex] && displayItems[selectedIndex].isFile) {
      previewFile(displayItems[selectedIndex]);
    } else {
      setPreviewContent(null);
      setIsPreviewPartial(false);
    }
  }, [selectedIndex]); // displayItemsを依存配列から削除

  // 選択項目変更時に自動スクロール
  useEffect(() => {
    if (displayItems.length > 0) {
      scrollSelectedItemIntoView(selectedIndex);
    }
  }, [selectedIndex, displayItems.length]); // scrollSelectedItemIntoViewを依存配列から削除、lengthのみ監視

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (syntaxHighlightTimeout) {
        clearTimeout(syntaxHighlightTimeout);
      }
      if (loadingAbortController) {
        loadingAbortController.abort();
      }
    };
  }, [syntaxHighlightTimeout, loadingAbortController]);

  return (
    <div className="image-explorer">
      {/* ヘッダー */}
      <header className="header">
        <div className="path-bar">
          <button onClick={goHome} className="path-btn" title="Go to startup directory (Home)">
            <span dangerouslySetInnerHTML={{ __html: generateSVGIcon('home', 16) }} />
          </button>
          <button onClick={goUp} className="path-btn" title="Go up (Backspace)">
            <span dangerouslySetInnerHTML={{ __html: generateSVGIcon('up', 16) }} />
          </button>
          <span className="current-path">{currentPath}</span>
        </div>
        <div className="controls">
          <span className="help-text">File Explorer</span>
        </div>
      </header>

      {/* 検索バー */}
      <div className="search-bar">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="🔍 Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                // 矢印キーでファイルリストにフォーカス移動
                e.preventDefault();
                e.currentTarget.blur();
                if (displayItems.length > 0) {
                  setSelectedIndex(e.key === 'ArrowDown' ? 0 : displayItems.length - 1);
                }
              }
              // Escapeはグローバルハンドラーに任せる
            }}
          />
          {searchQuery && (
            <button 
              className="search-clear-btn"
              onClick={clearSearch}
              title="Clear search (Esc)"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="search-results-count">
            {displayItems.length} result{displayItems.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <main className="main-content">
        {/* ファイル・ディレクトリリスト */}
        <div className="file-list-container" style={{ width: `${fileListWidth}px` }}>
          <div className="file-list" ref={fileListRef}>
            {displayItems.map((item, index) => (
              <div
                key={item.path}
                className={`file-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => setSelectedIndex(index)}
                onDoubleClick={() => openItem(item)}
              >
                <FileIcon item={item} getFileIcon={getFileIcon} detectFileType={detectFileType} />
                <span className="file-name">{item.name}</span>
                <span className="file-size">
                  {item.isDirectory ? '' : formatFileSize(item.size)}
                </span>
              </div>
            ))}
          </div>
          {/* ファイルリストリサイザー */}
          <div 
            className="resize-handle resize-handle-right"
            onMouseDown={() => setIsResizingFileList(true)}
          />
        </div>

        {/* プレビューパネル */}
        <div 
          className="preview-container"
          style={{ 
            marginRight: showMetadataSidebar ? `${metadataWidth}px` : '0'
          }}
        >
          <div className="preview-panel" ref={previewPanelRef}>
            {isLoadingFile ? (
              <div className="preview-loading">
                <h3>Loading preview...</h3>
                <p>Press <kbd>Escape</kbd> to cancel</p>
              </div>
            ) : previewContent ? (
              <div className="preview-content">
                {isPreviewPartial && (
                  <div className="preview-partial-warning">
                    ⚠️ Large file - showing partial content only
                  </div>
                )}
                {renderPreviewContent()}
              </div>
            ) : (
              <div className="preview-placeholder">
                <h3>Mireru - File Explorer</h3>
                <p>Select a file to preview</p>
                <div className="key-hints">
                  <div><kbd>n/p</kbd> Navigate next/prev</div>
                  <div><kbd>hjkl</kbd> Scroll preview (vim-style)</div>
                  <div><kbd>HJKL</kbd> Scroll preview (large)</div>
                  <div><kbd>Enter/e</kbd> Open folder/file</div>
                  <div><kbd>Space</kbd> Preview file</div>
                  <div><kbd>/</kbd> Focus search</div>
                  <div><kbd>Escape</kbd> Exit search / Clear preview</div>
                  <div><kbd>Shift+Escape</kbd> Clear search</div>
                  <div><kbd>Ctrl+C</kbd> Copy selected text</div>
                  <div><kbd>Ctrl+Shift+C</kbd> Copy file path</div>
                  <div><kbd>r</kbd> Reload current file</div>
                  <div><kbd>+/-</kbd> Zoom in/out (images)</div>
                  <div><kbd>Ctrl++/-</kbd> Text size up/down</div>
                  <div><kbd>Ctrl+0</kbd> Reset text size</div>
                  <div><kbd>f</kbd> Fit to window</div>
                  <div><kbd>o</kbd> Original size</div>
                  <div><kbd>i/F1</kbd> Toggle metadata</div>
                  <div><kbd>b</kbd> Toggle view mode (auto/text/binary)</div>
                  <div><kbd>Backspace</kbd> Go up</div>
                  <div><kbd>Home</kbd> Go home</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* メタ情報サイドバー */}
        {showMetadataSidebar && renderMetadataSidebar()}
      </main>

      {/* ステータスバー */}
      <footer className="status-bar">
        <span>{status}</span>
        <span>Folders: {displayItems.filter(item => item.isDirectory).length} | Files: {displayItems.filter(item => item.isFile).length}</span>
      </footer>
    </div>
  );
}

export default function App() {
  return <ImageExplorer />;
}
