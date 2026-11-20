import { App } from '@/app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Не найден элемент #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
