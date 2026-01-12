# Vercel + GitHub 開発構成ガイド

## 概要

このプロジェクトは以下の構成で動作しています：

```
GitHub (ソースコード管理)
    │
    │ push時に自動連携
    ▼
Vercel (ホスティング + API)
    ├── フロントエンド (Vite + React)
    └── サーバーレス関数 (API)
```

## 開発フロー

1. ローカルで開発
2. GitHubにpush
3. Vercelが自動でビルド＆デプロイ

## ファイル構成

```
todo_app/
├── api/                          # サーバーレス関数（API）
│   ├── extract-tasks.mjs         # タスク抽出API
│   └── generate-review.mjs       # 振り返り生成API
├── src/                          # フロントエンド
│   ├── App.jsx
│   └── ...
├── vercel.json                   # Vercel設定
├── vite.config.js                # Vite設定
└── package.json
```

## 新しいAPIを追加する手順

### 1. APIファイルを作成

`api/`フォルダに`.mjs`ファイルを作成：

```javascript
// api/my-new-api.mjs

export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // プリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { param1, param2 } = req.body;

    // 処理を書く
    const result = { success: true, data: '...' };

    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### 2. フロントエンドから呼び出す

```javascript
// src/App.jsx などで

const response = await fetch('/api/my-new-api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ param1: 'value1', param2: 'value2' })
});

const data = await response.json();
```

### 3. 環境変数を追加する場合

1. Vercelダッシュボード → Settings → Environment Variables
2. 変数名と値を追加（例: `MY_API_KEY`）
3. APIファイル内で `process.env.MY_API_KEY` で参照

### 4. GitHubにpush

```bash
git add api/my-new-api.mjs
git commit -m "feat: Add my-new-api endpoint"
git push
```

Vercelが自動でデプロイします。

## 重要な設定ファイル

### vercel.json

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercelではルート、GitHub Pagesでは/todo_app/
const base = process.env.GITHUB_PAGES ? '/todo_app/' : '/';

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    open: true
  }
});
```

## 注意点

1. **APIファイルの拡張子**: `.mjs`を使用（ESMモジュール対応）
2. **環境変数**: APIキーなどは必ずVercelの環境変数に設定（コードに直接書かない）
3. **CORS**: APIにはCORSヘッダーを設定する
4. **エラーハンドリング**: try-catchでエラーを適切に処理する

## URL

- 本番: https://todo-app-sooty-five-35.vercel.app/
- API: https://todo-app-sooty-five-35.vercel.app/api/extract-tasks
