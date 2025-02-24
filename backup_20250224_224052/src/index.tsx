import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import App from './App';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px' }}>
          <h1>發生錯誤</h1>
          <button onClick={() => window.location.reload()}>
            重新整理頁面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 全域錯誤處理
window.onerror = function(message, source, lineno, colno, error) {
  alert(`全域錯誤：${message}\n來源：${source}\n行號：${lineno}`);
  return false;
};

// 檢查 DOM 是否正確載入
document.addEventListener('DOMContentLoaded', () => {
  alert('DOM 已載入');
});

try {
  const container = document.getElementById('root');
  if (!container) {
    alert('找不到 root 元素！');
    throw new Error('找不到 root 元素');
  }

  alert('開始渲染 React 應用');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  alert('React 應用渲染完成');
} catch (error) {
  alert(`初始化錯誤：${error}`);
} 