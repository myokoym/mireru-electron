// Jest テスト共通セットアップ
import '@testing-library/jest-dom';

// Electron API のモック（JSDOM環境のみ）
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'electronAPI', {
    value: {
      getDirectoryContents: jest.fn().mockResolvedValue([]),
      readFile: jest.fn().mockResolvedValue({ type: 'text', content: 'test content', size: 100 }),
      getHomeDirectory: jest.fn().mockResolvedValue('/home/user'),
      getInitialDirectory: jest.fn().mockResolvedValue('/home/user'),
      getParentDirectory: jest.fn().mockResolvedValue('/home'),
      copyToClipboard: jest.fn().mockResolvedValue(undefined),
    },
    writable: true,
  });
}

// React Syntax Highlighter のモック
jest.mock('react-syntax-highlighter', () => ({
  Light: Object.assign(
    ({ children }: { children: string }) => {
      const React = require('react');
      return React.createElement('pre', { 'data-testid': 'syntax-highlighter' }, children);
    },
    {
      registerLanguage: jest.fn(),
    }
  ),
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/hljs', () => ({
  github: {},
}));

// 全言語のモック
const mockLanguage = () => ({});
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/javascript', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/typescript', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/python', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/ruby', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/php', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/java', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/c', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/cpp', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/csharp', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/go', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/rust', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/bash', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/xml', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/css', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/scss', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/json', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/yaml', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/markdown', () => mockLanguage);
jest.mock('react-syntax-highlighter/dist/esm/languages/hljs/sql', () => mockLanguage);

// Canvas のモック（JSDOM で canvas が利用できない問題を解決）
jest.mock('canvas', () => require('./mocks/canvas.js'));