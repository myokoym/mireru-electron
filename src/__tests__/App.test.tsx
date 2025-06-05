import { render } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    // 基本的なレンダリングテストのみ
    expect(container).toBeTruthy();
  });

  it('should render file list section', () => {
    const { container } = render(<App />);
    // ファイルリストセクションが存在することを確認
    const fileListSection = container.querySelector('.file-list');
    expect(fileListSection).toBeTruthy();
  });
});
