// グローバル変数
let currentPath = '';
let currentFiles = [];
let selectedIndex = 0;
let expandedDirs = new Set();
let currentScale = 1;

// DOM要素
const fileList = document.getElementById('file-list');
const previewPanel = document.getElementById('preview-panel');
const currentPathSpan = document.getElementById('current-path');
const statusText = document.getElementById('status-text');
const fileCount = document.getElementById('file-count');
const helpModal = document.getElementById('help-modal');

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        currentPath = await window.electronAPI.getHomeDirectory();
        await loadDirectory(currentPath);
        setupEventListeners();
        updateStatus('準備完了');
    } catch (error) {
        updateStatus(`エラー: ${error.message}`);
    }
});

// イベントリスナー設定
function setupEventListeners() {
    // ボタンイベント
    document.getElementById('home-btn').addEventListener('click', goHome);
    document.getElementById('up-btn').addEventListener('click', goUp);
    document.getElementById('reload-btn').addEventListener('click', reload);
    
    // キーボードイベント
    document.addEventListener('keydown', handleKeyPress);
    
    // ファイルリストフォーカス
    fileList.focus();
}

// ディレクトリの読み込み
async function loadDirectory(path) {
    try {
        updateStatus('読み込み中...');
        const files = await window.electronAPI.getDirectoryContents(path);
        currentPath = path;
        currentFiles = files;
        selectedIndex = 0;
        
        renderFileList();
        updatePathDisplay();
        updateFileCount();
        clearPreview();
        
        updateStatus('準備完了');
    } catch (error) {
        updateStatus(`エラー: ${error.message}`);
        console.error('Directory load error:', error);
    }
}

// ファイルリストの描画
function renderFileList() {
    fileList.innerHTML = '';
    
    currentFiles.forEach((file, index) => {
        const item = createFileItem(file, index);
        fileList.appendChild(item);
    });
    
    updateSelection();
}

// ファイルアイテムの作成
function createFileItem(file, index) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.dataset.index = index;
    
    const icon = document.createElement('span');
    icon.className = 'file-icon';
    icon.textContent = getFileIcon(file);
    
    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;
    
    const size = document.createElement('span');
    size.className = 'file-size';
    size.textContent = file.isDirectory ? '' : formatFileSize(file.size);
    
    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(size);
    
    // クリックイベント
    item.addEventListener('click', () => {
        selectedIndex = index;
        updateSelection();
        previewFile(file);
    });
    
    item.addEventListener('dblclick', () => {
        openFile(file);
    });
    
    return item;
}

// ファイルアイコンの取得
function getFileIcon(file) {
    if (file.isDirectory) {
        return expandedDirs.has(file.path) ? '📂' : '📁';
    }
    
    const ext = file.extension;
    switch (ext) {
        case '.txt': case '.md': case '.log': return '📄';
        case '.js': case '.json': case '.html': case '.css': return '💻';
        case '.jpg': case '.jpeg': case '.png': case '.gif': case '.bmp': case '.webp': return '🖼️';
        case '.mp4': case '.avi': case '.mov': case '.webm': return '🎬';
        case '.mp3': case '.wav': case '.flac': case '.m4a': return '🎵';
        case '.pdf': return '📋';
        case '.zip': case '.rar': case '.7z': case '.tar': case '.gz': return '📦';
        case '.exe': case '.app': case '.deb': case '.dmg': return '⚙️';
        default: return '📄';
    }
}

// ファイルサイズの書式設定
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 選択状態の更新
function updateSelection() {
    const items = fileList.querySelectorAll('.file-item');
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
    
    // 選択されたアイテムが見える位置にスクロール
    if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
}

// パス表示の更新
function updatePathDisplay() {
    currentPathSpan.textContent = currentPath;
}

// ファイル数の更新
function updateFileCount() {
    const dirCount = currentFiles.filter(f => f.isDirectory).length;
    const fileCount = currentFiles.filter(f => f.isFile).length;
    document.getElementById('file-count').textContent = 
        `📁 ${dirCount} | 📄 ${fileCount}`;
}

// ステータス更新
function updateStatus(message) {
    statusText.textContent = message;
}

// キーボード操作
function handleKeyPress(event) {
    // モーダルが開いている場合の処理
    if (helpModal.classList.contains('show')) {
        if (event.key === 'Escape' || event.key === 'h') {
            closeHelp();
        }
        return;
    }
    
    switch (event.key) {
        case 'j':
        case 'ArrowDown':
            event.preventDefault();
            moveSelection(1);
            break;
            
        case 'k':
        case 'ArrowUp':
            event.preventDefault();
            moveSelection(-1);
            break;
            
        case 'G':
            event.preventDefault();
            selectedIndex = currentFiles.length - 1;
            updateSelection();
            break;
            
        case 'g':
            if (event.ctrlKey) {
                event.preventDefault();
                selectedIndex = 0;
                updateSelection();
            }
            break;
            
        case 'h':
            if (!event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                showHelp();
            }
            break;
            
        case 'l':
        case 'ArrowRight':
        case 'Enter':
            event.preventDefault();
            if (currentFiles[selectedIndex]) {
                openFile(currentFiles[selectedIndex]);
            }
            break;
            
        case ' ':
            event.preventDefault();
            if (currentFiles[selectedIndex]) {
                previewFile(currentFiles[selectedIndex]);
            }
            break;
            
        case 'e':
            event.preventDefault();
            if (currentFiles[selectedIndex]?.isDirectory) {
                toggleDirectory(currentFiles[selectedIndex]);
            }
            break;
            
        case 'r':
            event.preventDefault();
            reload();
            break;
            
        case 'q':
            if (event.ctrlKey) {
                window.close();
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
            adjustScale(1.2);
            break;
            
        case '-':
            event.preventDefault();
            adjustScale(0.8);
            break;
            
        case 'f':
            event.preventDefault();
            fitToWindow();
            break;
            
        case 'o':
            event.preventDefault();
            resetScale();
            break;
            
        case 'Escape':
            event.preventDefault();
            clearPreview();
            break;
    }
    
    // Ctrl+Enter: 外部アプリで開く
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        if (currentFiles[selectedIndex]) {
            window.electronAPI.openExternal(currentFiles[selectedIndex].path);
        }
    }
}

// 選択移動
function moveSelection(direction) {
    selectedIndex = Math.max(0, Math.min(currentFiles.length - 1, selectedIndex + direction));
    updateSelection();
}

// ファイル/ディレクトリを開く
async function openFile(file) {
    if (file.isDirectory) {
        await loadDirectory(file.path);
    } else {
        // ファイルをプレビュー
        await previewFile(file);
    }
}

// ファイルプレビュー
async function previewFile(file) {
    try {
        updateStatus('プレビュー読み込み中...');
        
        if (file.isDirectory) {
            showDirectoryInfo(file);
            return;
        }
        
        const result = await window.electronAPI.readFile(file.path);
        
        previewPanel.innerHTML = '';
        
        switch (result.type) {
            case 'text':
                showTextPreview(result.content);
                break;
            case 'image':
                showImagePreview(result.content);
                break;
            case 'hex':
                showHexPreview(result.content);
                break;
        }
        
        updateStatus(`プレビュー: ${file.name} (${formatFileSize(result.size)})`);
    } catch (error) {
        previewPanel.innerHTML = `<div class="preview-placeholder">
            <p>プレビューできません</p>
            <p style="color: #ff6b6b; font-size: 12px;">${error.message}</p>
        </div>`;
        updateStatus(`プレビューエラー: ${error.message}`);
    }
}

// テキストプレビュー
function showTextPreview(content) {
    const textDiv = document.createElement('div');
    textDiv.className = 'preview-text';
    textDiv.textContent = content;
    previewPanel.appendChild(textDiv);
}

// 画像プレビュー
function showImagePreview(src) {
    const img = document.createElement('img');
    img.className = 'preview-image';
    img.src = src;
    img.style.transform = `scale(${currentScale})`;
    previewPanel.appendChild(img);
}

// Hexプレビュー
function showHexPreview(content) {
    const hexDiv = document.createElement('div');
    hexDiv.className = 'preview-hex';
    hexDiv.textContent = content;
    previewPanel.appendChild(hexDiv);
}

// ディレクトリ情報表示
function showDirectoryInfo(dir) {
    previewPanel.innerHTML = `
        <div class="preview-placeholder">
            <h3>📁 ${dir.name}</h3>
            <p>ディレクトリ</p>
            <p style="font-size: 12px; color: #808080; margin-top: 16px;">
                Enterで開く | eで展開/折りたたみ
            </p>
        </div>
    `;
}

// プレビュークリア
function clearPreview() {
    previewPanel.innerHTML = `
        <div class="preview-placeholder">
            <h3>Mireru</h3>
            <p>ファイルを選択してプレビューを表示</p>
            <div class="key-hints">
                <div><kbd>j/k</kbd> 上下移動</div>
                <div><kbd>h/l</kbd> 左右スクロール</div>
                <div><kbd>Enter</kbd> 開く</div>
                <div><kbd>Space</kbd> プレビュー</div>
                <div><kbd>e</kbd> 展開/折りたたみ</div>
                <div><kbd>r</kbd> リロード</div>
                <div><kbd>q</kbd> 終了</div>
            </div>
        </div>
    `;
    currentScale = 1;
}

// ディレクトリ展開/折りたたみ
function toggleDirectory(dir) {
    if (expandedDirs.has(dir.path)) {
        expandedDirs.delete(dir.path);
    } else {
        expandedDirs.add(dir.path);
    }
    renderFileList();
}

// スケール調整
function adjustScale(factor) {
    currentScale *= factor;
    currentScale = Math.max(0.1, Math.min(5, currentScale));
    
    const img = previewPanel.querySelector('.preview-image');
    if (img) {
        img.style.transform = `scale(${currentScale})`;
    }
}

// ウィンドウにフィット
function fitToWindow() {
    const img = previewPanel.querySelector('.preview-image');
    if (img) {
        const containerWidth = previewPanel.clientWidth - 32;
        const containerHeight = previewPanel.clientHeight - 32;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        const scaleX = containerWidth / imgWidth;
        const scaleY = containerHeight / imgHeight;
        currentScale = Math.min(scaleX, scaleY, 1);
        
        img.style.transform = `scale(${currentScale})`;
    }
}

// スケールリセット
function resetScale() {
    currentScale = 1;
    const img = previewPanel.querySelector('.preview-image');
    if (img) {
        img.style.transform = `scale(${currentScale})`;
    }
}

// ナビゲーション
async function goHome() {
    try {
        const homePath = await window.electronAPI.getHomeDirectory();
        await loadDirectory(homePath);
    } catch (error) {
        updateStatus(`エラー: ${error.message}`);
    }
}

async function goUp() {
    try {
        const parentPath = await window.electronAPI.getParentDirectory(currentPath);
        if (parentPath) {
            await loadDirectory(parentPath);
        }
    } catch (error) {
        updateStatus(`エラー: ${error.message}`);
    }
}

async function reload() {
    await loadDirectory(currentPath);
}

// ヘルプモーダル
function showHelp() {
    helpModal.classList.add('show');
}

function closeHelp() {
    helpModal.classList.remove('show');
}

// モーダル外クリックで閉じる
helpModal.addEventListener('click', (event) => {
    if (event.target === helpModal) {
        closeHelp();
    }
});