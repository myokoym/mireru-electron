// Chrome Extension版 Mireru - バニラJavaScript実装
// React依存を削除してChrome拡張機能のCSP制約に対応

class MireruApp {
  constructor() {
    this.files = [];
    this.selectedIndex = 0;
    this.previewContent = null;
    this.currentPath = '';
    this.initialPath = '';
    this.currentScale = 1;
    this.searchQuery = '';
    this.isSearchFocused = false;
    this.status = 'Select a directory to start';
    this.textFontSize = 12;
    this.isPreviewPartial = false;
    this.isMetaSidebarVisible = false;
    this.directorySelected = false;
    this.csvViewMode = 'table'; // 'table' or 'text'

    // DOM要素
    this.elements = {};
    
    // 定数
    this.IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    this.TEXT_EXTENSIONS = ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.xml', '.log', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h', '.sh', '.yaml', '.yml'];
    this.VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'];
    this.PDF_EXTENSIONS = ['.pdf'];
    this.CSV_EXTENSIONS = ['.csv'];

    this.init();
  }

  // Papa Parseライブラリを読み込み
  async loadPapaParseLibrary() {
    return new Promise((resolve, reject) => {
      if (window.Papa) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'papa-parse.min.js';
      script.onload = () => {
        console.log('Papa Parse library loaded');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load Papa Parse library:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  // CSVデータをパースしてHTMLテーブルに変換
  parseCSVToTable(csvContent) {
    try {
      const result = Papa.parse(csvContent, {
        header: false,
        skipEmptyLines: true,
        delimiter: '',  // 自動検出
        quoteChar: '"',
        escapeChar: '"'
      });

      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }

      const data = result.data;
      if (data.length === 0) {
        return '<div class="csv-empty">No data found in CSV file.</div>';
      }

      // 最大1000行に制限（パフォーマンス対策）
      const maxRows = 1000;
      const limitedData = data.slice(0, maxRows);
      const isLimited = data.length > maxRows;

      let tableHTML = '<div class="csv-table-container">';
      
      if (isLimited) {
        tableHTML += `<div class="csv-notice">⚠️ Large CSV file - showing first ${maxRows} rows only (total: ${data.length} rows)</div>`;
      }

      tableHTML += '<table class="csv-table"><thead><tr>';
      
      // ヘッダー行（最初の行）
      const headerRow = limitedData[0] || [];
      headerRow.forEach((cell, index) => {
        tableHTML += `<th class="csv-header">${this.escapeHtml(cell || `Column ${index + 1}`)}</th>`;
      });
      tableHTML += '</tr></thead><tbody>';

      // データ行
      for (let i = 1; i < limitedData.length; i++) {
        const row = limitedData[i];
        tableHTML += `<tr class="csv-row">`;
        for (let j = 0; j < Math.max(headerRow.length, row.length); j++) {
          const cellValue = row[j] || '';
          tableHTML += `<td class="csv-cell">${this.escapeHtml(cellValue)}</td>`;
        }
        tableHTML += '</tr>';
      }

      tableHTML += '</tbody></table></div>';
      return tableHTML;
    } catch (error) {
      console.error('CSV parsing error:', error);
      return `<div class="csv-error">Error parsing CSV: ${this.escapeHtml(error.message)}</div>`;
    }
  }

  // SVGアイコン生成関数
  generateSVGIcon(type, size = 16) {
    const svgStart = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    const svgEnd = '</svg>';
    
    switch (type) {
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
        return '';
    }
  }

  async init() {
    try {
      console.log('MireruApp init started');
      
      // Papa Parseライブラリを読み込み
      await this.loadPapaParseLibrary();
      
      // DOM要素の取得
      this.elements = {
        root: document.getElementById('root'),
        loading: document.getElementById('loading'),
        welcomeMessage: document.getElementById('welcome-message')
      };

      // API互換性チェック
      if (!window.isFileSystemAccessSupported()) {
        console.log('File System Access API not supported');
        this.showUnsupportedBrowser();
        return;
      }

      console.log('Creating UI...');
      // アプリケーションUI作成
      this.createUI();
      
      console.log('Setting up event listeners...');
      // イベントリスナー設定
      this.setupEventListeners();
      
      console.log('Initializing app...');
      // 初期化
      await this.initializeApp();
      
      console.log('Hiding loading screen...');
      // ローディング画面を非表示
      this.hideLoading();
      this.showWelcomeMessage();
      
      console.log('MireruApp init completed');
    } catch (error) {
      console.error('Error during MireruApp initialization:', error);
      this.hideLoading();
      this.showError('Initialization failed: ' + error.message);
    }
  }

  hideLoading() {
    if (this.elements.loading) {
      this.elements.loading.style.display = 'none';
    }
  }

  showWelcomeMessage() {
    if (this.elements.welcomeMessage && !localStorage.getItem('mireru-welcome-dismissed')) {
      this.elements.welcomeMessage.style.display = 'block';
      setTimeout(() => {
        this.elements.welcomeMessage.style.display = 'none';
        localStorage.setItem('mireru-welcome-dismissed', 'true');
      }, 8000);
    }
  }

  showUnsupportedBrowser() {
    this.elements.root.innerHTML = `
      <div style="max-width: 600px; margin: 50px auto; padding: 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        <h1 style="color: #d73027; margin-bottom: 20px;">🚫 Browser Not Supported</h1>
        <p>Mireru requires the <strong>File System Access API</strong> which is currently only supported in:</p>
        <ul style="text-align: left; max-width: 300px; margin: 20px auto;">
          <li>Google Chrome 86+</li>
          <li>Microsoft Edge 86+</li>
          <li>Brave Browser (experimental)</li>
        </ul>
        <p>Please use one of these browsers for full functionality.</p>
      </div>
    `;
    this.hideLoading();
  }

  showError(message) {
    this.elements.root.innerHTML = `
      <div style="max-width: 600px; margin: 50px auto; padding: 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        <h1 style="color: #d73027; margin-bottom: 20px;">❌ Error</h1>
        <p style="color: #333; margin-bottom: 20px;">${message}</p>
        <p style="color: #666; font-size: 14px;">Please check the browser console for more details.</p>
      </div>
    `;
  }

  createUI() {
    this.elements.root.innerHTML = `
      <div class="app">
        <!-- ヘッダー -->
        <header class="header">
          <div class="header-content">
            <div class="path-section">
              <button id="home-btn" class="path-btn" title="Go to startup directory (Home)" style="display: none;">
                <span id="home-icon"></span>
              </button>
              <button id="up-btn" class="path-btn" title="Go up (Backspace)" style="display: none;">
                <span id="up-icon"></span>
              </button>
              <span class="current-path" id="current-path">📁 No directory selected</span>
              <button id="copy-path-btn" class="path-btn" title="Copy path to clipboard" style="display: none;">
                <span id="copy-path-icon">📋</span>
              </button>
            </div>
            <div class="controls">
              <button id="directory-picker-btn" class="directory-picker-btn" style="display: none;">📂 Select Directory</button>
              <button id="refresh-btn" class="control-btn" title="Select different directory">🔄</button>
              <button id="meta-toggle-btn" class="control-btn" title="Toggle metadata sidebar (i)">ℹ️</button>
            </div>
          </div>
        </header>

        <div class="main-content">
          <!-- ファイルリスト -->
          <div class="file-list-container">
            <div class="search-bar">
              <div class="search-input-container">
                <input id="search-input" type="text" placeholder="Search files... (Press / to focus)" class="search-input">
              </div>
            </div>
            
            <div class="file-list">
              <div id="no-directory" class="no-directory">
                <p>📂 Select a directory to start browsing files</p>
                <button id="select-directory-btn" class="select-directory-btn">Choose Directory</button>
              </div>
              
              <div id="file-items" class="file-items" style="display: none;"></div>
            </div>
          </div>

          <!-- プレビューパネル -->
          <div class="preview-panel">
            <div id="preview-placeholder" class="preview-placeholder">
              <p>Select a file to preview</p>
              <div id="file-info" class="file-info" style="display: none;"></div>
            </div>
            <div id="preview-content" class="preview-content" style="display: none;"></div>
          </div>

          <!-- メタ情報サイドバー -->
          <div id="meta-sidebar" class="meta-sidebar" style="display: none;">
            <div class="meta-header">
              <h3>File Information</h3>
              <button id="meta-close-btn" class="close-btn">✕</button>
            </div>
            <div id="meta-content" class="meta-content"></div>
          </div>
        </div>

        <!-- ステータスバー -->
        <footer class="status-bar">
          <span id="status-text" class="status-text">Select a directory to start</span>
          <span id="file-count" class="file-count" style="display: none;"></span>
        </footer>
      </div>
    `;
  }

  setupEventListeners() {
    // DOM要素取得
    this.elements.searchInput = document.getElementById('search-input');
    this.elements.directoryPickerBtn = document.getElementById('directory-picker-btn');
    this.elements.selectDirectoryBtn = document.getElementById('select-directory-btn');
    this.elements.refreshBtn = document.getElementById('refresh-btn');
    this.elements.metaToggleBtn = document.getElementById('meta-toggle-btn');
    this.elements.metaCloseBtn = document.getElementById('meta-close-btn');
    this.elements.currentPath = document.getElementById('current-path');
    this.elements.noDirectory = document.getElementById('no-directory');
    this.elements.fileItems = document.getElementById('file-items');
    this.elements.previewPlaceholder = document.getElementById('preview-placeholder');
    this.elements.previewContent = document.getElementById('preview-content');
    this.elements.metaSidebar = document.getElementById('meta-sidebar');
    this.elements.statusText = document.getElementById('status-text');
    this.elements.fileCount = document.getElementById('file-count');
    this.elements.fileInfo = document.getElementById('file-info');
    this.elements.metaContent = document.getElementById('meta-content');
    this.elements.homeBtn = document.getElementById('home-btn');
    this.elements.upBtn = document.getElementById('up-btn');
    this.elements.homeIcon = document.getElementById('home-icon');
    this.elements.upIcon = document.getElementById('up-icon');
    this.elements.copyPathBtn = document.getElementById('copy-path-btn');
    this.elements.copyPathIcon = document.getElementById('copy-path-icon');

    // SVGアイコンを設定
    if (this.elements.homeIcon) {
      this.elements.homeIcon.innerHTML = this.generateSVGIcon('home', 16);
    }
    if (this.elements.upIcon) {
      this.elements.upIcon.innerHTML = this.generateSVGIcon('up', 16);
    }

    // イベントリスナー
    this.elements.selectDirectoryBtn.addEventListener('click', () => this.handleDirectorySelect());
    this.elements.directoryPickerBtn.addEventListener('click', () => this.handleDirectorySelect());
    this.elements.refreshBtn.addEventListener('click', () => this.handleDirectorySelect());
    this.elements.metaToggleBtn.addEventListener('click', () => this.toggleMetaSidebar());
    this.elements.metaCloseBtn.addEventListener('click', () => this.toggleMetaSidebar());
    
    // ナビゲーションボタン
    this.elements.homeBtn.addEventListener('click', () => this.goHome());
    this.elements.upBtn.addEventListener('click', () => this.goUp());
    
    // パスコピーボタン
    this.elements.copyPathBtn.addEventListener('click', () => this.copyCurrentPath());

    this.elements.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateFileList();
    });

    this.elements.searchInput.addEventListener('focus', () => {
      this.isSearchFocused = true;
    });

    this.elements.searchInput.addEventListener('blur', () => {
      this.isSearchFocused = false;
    });

    // キーボードイベント
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Welcome通知の閉じるボタン
    if (this.elements.welcomeMessage) {
      const closeBtn = this.elements.welcomeMessage.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.elements.welcomeMessage.style.display = 'none';
          localStorage.setItem('mireru-welcome-dismissed', 'true');
        });
      }
    }
  }

  async initializeApp() {
    try {
      this.updateStatus('Initializing...');
      
      // Chrome ストレージから最後のディレクトリを読み込み
      const lastDirectory = await window.webElectronAPI.loadLastDirectory();
      if (lastDirectory) {
        this.updateStatus(`Last used: ${lastDirectory} - Select directory to continue`);
      } else {
        this.updateStatus('Ready - Please select a directory');
      }
    } catch (error) {
      this.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleDirectorySelect() {
    try {
      const dirPath = await window.pickDirectory();
      this.currentPath = dirPath;
      this.initialPath = dirPath;
      this.directorySelected = true;
      
      // Chrome ストレージに保存
      await window.webElectronAPI.saveLastDirectory(dirPath);
      
      // UI更新
      this.elements.currentPath.textContent = `📁 ${dirPath}`;
      this.elements.noDirectory.style.display = 'none';
      this.elements.fileItems.style.display = 'block';
      this.elements.directoryPickerBtn.style.display = 'none';
      this.elements.homeBtn.style.display = 'inline-block';
      this.elements.upBtn.style.display = 'inline-block';
      this.elements.copyPathBtn.style.display = 'inline-block';
      
      await this.loadDirectory(dirPath);
      this.updateStatus('Ready');
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        this.updateStatus('Directory selection cancelled');
      } else {
        this.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async goHome() {
    if (this.initialPath && this.currentPath !== this.initialPath) {
      await this.loadDirectory(this.initialPath);
    }
  }

  async goUp() {
    if (this.currentPath && this.currentPath !== this.initialPath) {
      try {
        const parentPath = await window.webElectronAPI.getParentDirectory(this.currentPath);
        await this.loadDirectory(parentPath);
      } catch (error) {
        this.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  async loadDirectory(path) {
    try {
      this.updateStatus('Loading...');
      
      // 状態をリセット
      this.previewContent = null;
      this.isPreviewPartial = false;
      this.currentScale = 1;
      this.textFontSize = 12;
      this.searchQuery = '';
      this.isSearchFocused = false;
      this.elements.searchInput.value = '';
      
      this.currentPath = path;
      this.elements.currentPath.textContent = `📁 ${path}`;
      
      const items = await window.webElectronAPI.getDirectoryContents(path);
      
      this.files = items;
      this.selectedIndex = 0;
      this.updateFileList();
      this.updateStatus(`Ready - ${items.length} items`);
      
      // プレビューをクリア
      this.clearPreview();
    } catch (error) {
      this.updateStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  updateFileList() {
    const filteredFiles = this.files.filter(file =>
      this.searchQuery === '' || file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    this.elements.fileItems.innerHTML = '';
    
    filteredFiles.forEach((file, index) => {
      const fileElement = document.createElement('div');
      fileElement.className = `file-item ${index === this.selectedIndex ? 'selected' : ''}`;
      
      const icon = file.isDirectory ? '📁' : 
                   this.IMAGE_EXTENSIONS.includes(file.extension) ? '🖼️' :
                   this.VIDEO_EXTENSIONS.includes(file.extension) ? '🎬' :
                   this.PDF_EXTENSIONS.includes(file.extension) ? '📋' :
                   this.CSV_EXTENSIONS.includes(file.extension) ? '📊' :
                   this.TEXT_EXTENSIONS.includes(file.extension) ? '📄' : '📄';
      
      fileElement.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${file.isFile ? this.formatFileSize(file.size) : ''}</span>
      `;
      
      fileElement.addEventListener('click', async () => {
        this.selectedIndex = index;
        this.updateFileList(); // 選択状態を更新
        
        if (file.isDirectory) {
          await this.loadDirectory(file.path);
        } else {
          await this.loadFilePreview(file.path);
        }
      });
      
      this.elements.fileItems.appendChild(fileElement);
    });

    // ファイル数更新
    if (filteredFiles.length > 0 && this.elements.fileCount) {
      this.elements.fileCount.style.display = 'inline';
      this.elements.fileCount.textContent = `${this.selectedIndex + 1} / ${filteredFiles.length}${this.searchQuery ? ` (filtered from ${this.files.length})` : ''}`;
    } else if (this.elements.fileCount) {
      this.elements.fileCount.style.display = 'none';
    }

    // 選択されたファイル情報の更新
    this.updateSelectedFileInfo(filteredFiles[this.selectedIndex]);
  }

  updateSelectedFileInfo(selectedFile) {
    if (selectedFile && this.previewContent === null) {
      this.elements.fileInfo.style.display = 'block';
      this.elements.fileInfo.innerHTML = `
        <h3>${selectedFile.name}</h3>
        <p>Type: ${selectedFile.isDirectory ? 'Directory' : 'File'}</p>
        ${selectedFile.isFile ? `<p>Size: ${this.formatFileSize(selectedFile.size)}</p>` : ''}
        ${selectedFile.isFile ? `<p>Modified: ${selectedFile.modified.toLocaleString()}</p>` : ''}
      `;
    } else {
      this.elements.fileInfo.style.display = 'none';
    }

    // メタサイドバーの更新
    if (this.isMetaSidebarVisible && selectedFile) {
      this.updateMetaSidebar(selectedFile);
    }
  }

  async loadFilePreview(filePath) {
    try {
      this.updateStatus('Loading file...');
      const result = await window.webElectronAPI.readFile(filePath);
      this.previewContent = result;
      this.isPreviewPartial = result.isPartial || false;
      this.showPreview(result);
      this.updateStatus('Ready');
    } catch (error) {
      this.updateStatus(`Error loading file: ${error instanceof Error ? error.message : String(error)}`);
      this.clearPreview();
    }
  }

  showPreview(content) {
    this.elements.previewPlaceholder.style.display = 'none';
    this.elements.previewContent.style.display = 'block';
    
    let previewHTML = '';
    
    switch (content.type) {
      case 'csv':
        if (this.csvViewMode === 'table') {
          previewHTML = `
            <div class="csv-preview-header">
              <div class="csv-view-controls">
                <button class="csv-view-btn active" data-view="table">📊 Table View</button>
                <button class="csv-view-btn" data-view="text">📄 Text View</button>
              </div>
            </div>
            ${this.parseCSVToTable(content.content)}
          `;
        } else {
          previewHTML = `
            <div class="csv-preview-header">
              <div class="csv-view-controls">
                <button class="csv-view-btn" data-view="table">📊 Table View</button>
                <button class="csv-view-btn active" data-view="text">📄 Text View</button>
              </div>
            </div>
            ${this.isPreviewPartial ? '<div class="partial-notice">⚠️ Large file - showing first 100KB only</div>' : ''}
            <pre class="preview-text" style="font-size: ${this.textFontSize}px;">${this.escapeHtml(content.content)}</pre>
          `;
        }
        break;

      case 'text':
        previewHTML = `
          ${this.isPreviewPartial ? '<div class="partial-notice">⚠️ Large file - showing first 100KB only</div>' : ''}
          <pre class="preview-text" style="font-size: ${this.textFontSize}px;">${this.escapeHtml(content.content)}</pre>
        `;
        break;
      
      case 'image':
        previewHTML = `
          <div class="image-preview">
            <img src="${content.content}" alt="Preview" style="transform: scale(${this.currentScale}); transform-origin: top left; max-width: 100%; height: auto;">
          </div>
        `;
        break;
      
      case 'video':
        previewHTML = `
          <div class="video-preview">
            <video controls style="max-width: 100%; height: auto;">
              <source src="${content.content}">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
        break;
      
      case 'pdf':
        previewHTML = `
          <div class="pdf-preview-simple" style="padding: 20px; text-align: center; height: calc(100vh - 200px); display: flex; flex-direction: column;">
            <h3>📋 PDF Document</h3>
            <p>PDF Preview</p>
            <iframe src="${content.content}" style="border: 1px solid #ddd; border-radius: 4px; flex: 1; width: 100%;"></iframe>
          </div>
        `;
        break;
      
      case 'hex':
        previewHTML = `
          ${this.isPreviewPartial ? '<div class="partial-notice">⚠️ Large binary file - showing first 20KB only</div>' : ''}
          <pre class="preview-hex">${this.escapeHtml(content.content)}</pre>
        `;
        break;
    }
    
    this.elements.previewContent.innerHTML = previewHTML;
    
    // CSVビュー切り替えボタンのイベントリスナーを追加
    if (content.type === 'csv') {
      this.setupCSVViewControls(content);
    }
  }

  // CSVビュー切り替えコントロールのセットアップ
  setupCSVViewControls(content) {
    const viewButtons = this.elements.previewContent.querySelectorAll('.csv-view-btn');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const newViewMode = e.target.getAttribute('data-view');
        if (newViewMode !== this.csvViewMode) {
          this.csvViewMode = newViewMode;
          this.showPreview(content); // 再描画
        }
      });
    });
  }

  clearPreview() {
    this.previewContent = null;
    this.csvViewMode = 'table'; // CSV表示モードをリセット
    this.elements.previewPlaceholder.style.display = 'block';
    this.elements.previewContent.style.display = 'none';
  }

  toggleMetaSidebar() {
    this.isMetaSidebarVisible = !this.isMetaSidebarVisible;
    this.elements.metaSidebar.style.display = this.isMetaSidebarVisible ? 'block' : 'none';
    
    // ボタンのactive状態を更新
    if (this.elements.metaToggleBtn) {
      if (this.isMetaSidebarVisible) {
        this.elements.metaToggleBtn.classList.add('active');
      } else {
        this.elements.metaToggleBtn.classList.remove('active');
      }
    }
    
    if (this.isMetaSidebarVisible) {
      const filteredFiles = this.files.filter(file =>
        this.searchQuery === '' || file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      const selectedFile = filteredFiles[this.selectedIndex];
      if (selectedFile) {
        this.updateMetaSidebar(selectedFile);
      }
    }
  }

  updateMetaSidebar(selectedFile) {
    this.elements.metaContent.innerHTML = `
      <div class="meta-section">
        <h4>Basic Info</h4>
        <div class="meta-item">
          <span class="meta-label">Name:</span>
          <span class="meta-value">${selectedFile.name}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Type:</span>
          <span class="meta-value">${selectedFile.isDirectory ? 'Directory' : 'File'}</span>
        </div>
        ${selectedFile.isFile ? `
          <div class="meta-item">
            <span class="meta-label">Size:</span>
            <span class="meta-value">${this.formatFileSize(selectedFile.size)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Extension:</span>
            <span class="meta-value">${selectedFile.extension || 'None'}</span>
          </div>
        ` : ''}
        <div class="meta-item">
          <span class="meta-label">Modified:</span>
          <span class="meta-value">${selectedFile.modified.toLocaleString()}</span>
        </div>
      </div>
      <div class="meta-section">
        <h4>Path Info</h4>
        <div class="meta-item">
          <span class="meta-label">Full Path:</span>
          <span class="meta-value mono">${selectedFile.path}</span>
        </div>
      </div>
    `;
  }

  async handleKeyDown(event) {
    // 検索フォーカス時の特別処理
    if (this.isSearchFocused) {
      if (event.key === 'Escape') {
        if (event.shiftKey) {
          this.searchQuery = '';
          this.elements.searchInput.value = '';
          this.updateFileList();
        }
        this.isSearchFocused = false;
        this.elements.searchInput.blur();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        this.isSearchFocused = false;
        this.elements.searchInput.blur();
        // 以下のファイルナビゲーション処理に続行
      } else {
        return; // 検索フォーカス時は他のキー操作をブロック
      }
    }

    const filteredFiles = this.files.filter(file =>
      this.searchQuery === '' || file.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    if (filteredFiles.length === 0) return;

    switch (event.key) {
      case 'n':
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, filteredFiles.length - 1);
        this.updateFileList();
        break;
      case 'p':
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateFileList();
        break;
      case 'G':
        event.preventDefault();
        this.selectedIndex = filteredFiles.length - 1;
        this.updateFileList();
        break;
      case 'g':
        if (event.ctrlKey) {
          event.preventDefault();
          this.selectedIndex = 0;
          this.updateFileList();
        }
        break;
      case 'Enter':
      case 'e':
      case ' ':
        event.preventDefault();
        const selectedFile = filteredFiles[this.selectedIndex];
        if (selectedFile) {
          if (selectedFile.isDirectory) {
            await this.loadDirectory(selectedFile.path);
          } else {
            await this.loadFilePreview(selectedFile.path);
          }
        }
        break;
      case 'Backspace':
        event.preventDefault();
        await this.goUp();
        break;
      case 'Home':
        event.preventDefault();
        await this.goHome();
        break;
      case '/':
        event.preventDefault();
        this.isSearchFocused = true;
        this.elements.searchInput.focus();
        break;
      case 'Escape':
        if (!this.isSearchFocused) {
          this.clearPreview();
        }
        break;
      case 'i':
      case 'F1':
        event.preventDefault();
        this.toggleMetaSidebar();
        break;
    }
  }

  updateStatus(message) {
    this.status = message;
    if (this.elements.statusText) {
      this.elements.statusText.textContent = message;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // パスをクリップボードにコピー
  async copyCurrentPath() {
    if (!this.currentPath) {
      this.updateStatus('No directory selected');
      return;
    }

    try {
      await navigator.clipboard.writeText(this.currentPath);
      this.updateStatus('Path copied to clipboard');
      
      // アイコンを一時的に変更してフィードバックを提供
      const originalIcon = this.elements.copyPathIcon.textContent;
      this.elements.copyPathIcon.textContent = '✅';
      setTimeout(() => {
        this.elements.copyPathIcon.textContent = originalIcon;
      }, 1000);
    } catch (error) {
      console.error('Failed to copy path:', error);
      this.updateStatus('Failed to copy path');
    }
  }
}

// アプリケーション初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing MireruApp');
    new MireruApp();
  });
} else {
  console.log('DOM already loaded, initializing MireruApp');
  new MireruApp();
}