import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import App from './App';
import './styles/global.css';

// Vercel Web Analytics：页面访问量 / 访客数 / 来源等前端分析。
// inject 会监听 History API，SPA 内切换页面（router）也会被自动上报。
inject({
  mode: import.meta.env.PROD ? 'production' : 'development',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
