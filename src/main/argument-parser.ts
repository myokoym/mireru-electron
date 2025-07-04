import path from 'path';
import fs from 'fs';
import os from 'os';

export function parseInitialDirectory(argv: string[]): string {
  console.log('DEBUG: All process.argv:', argv);
  console.log('DEBUG: process.cwd():', process.cwd());
  
  // 開発時の環境変数チェック（本番には影響しない）
  const devPath = process.env.MIRERU_DEV_PATH;
  if (devPath && process.env.NODE_ENV === 'development') {
    console.log('DEBUG: Using development environment variable:', devPath);
    try {
      const resolvedPath = path.resolve(devPath);
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        console.log('DEBUG: Using dev env directory:', resolvedPath);
        return resolvedPath;
      } else if (stat.isFile()) {
        const parentDir = path.dirname(resolvedPath);
        console.log('DEBUG: Using dev env parent directory:', parentDir);
        return parentDir;
      }
    } catch (error) {
      console.warn(`Invalid dev path: ${devPath}, falling back to args`);
    }
  }
  
  // 開発環境と本番環境で引数の位置が異なる
  let args: string[];
  if (argv[0].includes('/electron') && argv.includes('.')) {
    // 開発環境: /path/to/electron [electronmon args...] . [user args...]
    console.log('DEBUG: Detected development mode');
    const dotIndex = argv.indexOf('.');
    args = argv.slice(dotIndex + 1);
  } else {
    // 本番環境: ./app args...
    console.log('DEBUG: Detected production mode');
    args = argv.slice(1);
  }
  
  console.log('DEBUG: Parsed args:', args);
  
  if (args.length > 0) {
    let targetPath = args[0];
    console.log('DEBUG: Original target path:', targetPath);
    
    // ドット（.）が指定された場合は現在のワーキングディレクトリを使用
    if (targetPath === '.') {
      targetPath = process.cwd();
      console.log('DEBUG: Dot resolved to:', targetPath);
    }
    
    try {
      // パスが存在し、ディレクトリかチェック
      const resolvedPath = path.resolve(targetPath);
      console.log('DEBUG: Resolved path:', resolvedPath);
      const stat = fs.statSync(resolvedPath);
      if (stat.isDirectory()) {
        console.log('DEBUG: Using directory:', resolvedPath);
        return resolvedPath;
      } else if (stat.isFile()) {
        // ファイルが指定された場合は親ディレクトリを返す
        const parentDir = path.dirname(resolvedPath);
        console.log('DEBUG: Using parent directory of file:', parentDir);
        return parentDir;
      }
    } catch (error) {
      console.warn(`Invalid path specified: ${targetPath}, falling back to home directory`);
    }
  }
  
  // 引数がない、または無効な場合はホームディレクトリ
  const homeDir = os.homedir();
  console.log('DEBUG: Using home directory:', homeDir);
  return homeDir;
}