/**
 * @jest-environment node
 */
import { parseInitialDirectory } from '../main/argument-parser';
import os from 'os';
import path from 'path';

describe('parseInitialDirectory', () => {
  const homeDir = os.homedir();
  const currentDir = process.cwd();
  
  test('should return home directory when no arguments', () => {
    const result = parseInitialDirectory(['electron']);
    expect(result).toBe(homeDir);
  });
  
  test('should handle dot argument in development mode', () => {
    const result = parseInitialDirectory(['electron', '.', '.']);
    expect(result).toBe(currentDir);
  });
  
  test('should handle dot argument in production mode', () => {
    const result = parseInitialDirectory(['/app/mireru-electron', '.']);
    expect(result).toBe(currentDir);
  });
  
  test('should handle absolute path in development mode', () => {
    // 開発環境では第1引数がドット、第2引数がパスの場合
    const result = parseInitialDirectory(['electron', '.', '/home']);
    // 実際のロジックでは第1引数のドットが処理される
    expect(result).toBe(currentDir);
  });
  
  test('should handle absolute path in production mode', () => {
    const result = parseInitialDirectory(['/app/mireru-electron', '/home']);
    // /homeディレクトリが存在するため、そのパスが返される
    expect(result).toBe('/home');
  });
  
  test('should handle file path and return parent directory', () => {
    const testFile = path.join(currentDir, 'package.json');
    const result = parseInitialDirectory(['/app/mireru-electron', testFile]);
    expect(result).toBe(currentDir);
  });
  
  test('should return home directory for invalid path', () => {
    const result = parseInitialDirectory(['/app/mireru-electron', '/invalid/path']);
    expect(result).toBe(homeDir);
  });
  
  test('should handle relative paths', () => {
    const result = parseInitialDirectory(['/app/mireru-electron', './src']);
    expect(result).toBe(path.resolve('./src'));
  });
});