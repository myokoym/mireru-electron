// 簡単なHTTPサーバー（File System Access API テスト用）
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HOSTNAME = 'localhost';

// MIMEタイプマッピング
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  return mimeTypes[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/test.html' : req.url;
  
  // セキュリティ: パストラバーサル防止
  if (filePath.includes('..')) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  
  // web ディレクトリからファイルを提供
  const fullPath = path.join(__dirname, filePath);
  
  // assets ディレクトリへのアクセス処理
  if (filePath.startsWith('/assets/')) {
    const assetsPath = path.join(__dirname, '../../assets', filePath.replace('/assets/', ''));
    serveFile(assetsPath, res);
    return;
  }
  
  serveFile(fullPath, res);
});

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*', // CORS許可
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    });
    res.end(data);
  });
}

server.listen(PORT, HOSTNAME, () => {
  console.log('🚀 Mireru Web Test Server');
  console.log(`📍 Server running at http://${HOSTNAME}:${PORT}/`);
  console.log('🔬 Open the URL above to test File System Access API');
  console.log('');
  console.log('📋 Test Pages:');
  console.log(`   • API Test: http://${HOSTNAME}:${PORT}/test.html`);
  console.log('');
  console.log('⚠️  Note: File System Access API requires HTTPS in production');
  console.log('   However, localhost works for development testing');
  console.log('');
  console.log('🛑 Press Ctrl+C to stop the server');
});

// graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server received SIGTERM...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});