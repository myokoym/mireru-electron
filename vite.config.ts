import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/web',
  base: './',
  build: {
    outDir: '../../dist-web',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/web/index.html'),
      },
    },
  },
  publicDir: '../../assets',
  server: {
    port: 3000,
    open: true,
    host: true,
    https: false, // 開発環境では http でも File System Access API が動作
  },
  preview: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-syntax-highlighter',
      'react-pdf',
    ],
  },
  define: {
    // development モードでの File System Access API サポート
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@web': resolve(__dirname, 'src/web'),
      '@renderer': resolve(__dirname, 'src/renderer'),
    },
  },
});