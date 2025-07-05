// Web版 Mireru のエントリーポイント
import { createRoot } from 'react-dom/client';
import WebImageExplorer from './WebApp';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<WebImageExplorer />);