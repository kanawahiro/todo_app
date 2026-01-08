import React from 'react';
import { createRoot } from 'react-dom/client';
import TaskManagerApp from './App.jsx';
import './storage.js'; // ストレージAPIを初期化

// APIキーを環境変数から取得（必要に応じて設定）
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TaskManagerApp apiKey={apiKey} />
  </React.StrictMode>
);
