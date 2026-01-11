# Vercel KV + メール認証 実装計画書

## 1. 現状確認

### 既に持っているアカウント
- ✅ **Vercel** アカウント（todo_app デプロイ済み）
- ✅ **Google AI Studio** アカウント（Gemini API使用中）

### 新規登録が必要なサービス（2つ）
- ❌ **Vercel KV** （Vercelダッシュボードで有効化が必要）
- ❌ **Resend** アカウント（メール送信API）

---

## 2. 作業順序（重要）

### 推奨順序：アカウント取得 → プログラミング

**理由:**
1. Vercel KV と Resend の **APIキー・接続情報** が必要
2. コードにこれらの情報を埋め込むため、先に取得しておく
3. 取得後、環境変数を設定してから実装開始

---

## 3. 全体スケジュール

```
【第1段階】サービス登録・環境構築（30分）
  ├─ Vercel KV 有効化（5分）
  ├─ Resend アカウント作成（10分）
  ├─ Resend APIキー取得（5分）
  └─ Vercel環境変数設定（10分）

【第2段階】プログラミング（90分）
  ├─ 依存関係インストール（5分）
  ├─ APIファイル作成（40分）
  │   ├─ /api/auth/send-code.mjs
  │   ├─ /api/auth/verify-code.mjs
  │   ├─ /api/tasks/save.mjs
  │   └─ /api/tasks/load.mjs
  ├─ フロントエンド改修（40分）
  │   ├─ ログイン画面
  │   └─ データ同期ロジック
  └─ テスト（5分）

【第3段階】デプロイ・検証（15分）
  ├─ Git commit & push
  ├─ Vercel自動デプロイ
  └─ 本番環境テスト
```

---

## 4. 第1段階：サービス登録・環境構築（詳細手順）

### ステップ1: Vercel KV 有効化（5分）

**手順:**
1. Vercel Dashboard を開く: https://vercel.com/dashboard
2. プロジェクト `todo_app` を選択
3. **Storage** タブをクリック
4. **Create Database** → **KV** を選択
5. データベース名: `todo_app_kv` （任意）
6. Region: `Washington, D.C., USA (iad1)` （推奨：レイテンシ低い）
7. **Create** をクリック
8. 自動的に環境変数が設定される（確認のみ）

**確認:**
- Environment Variables に以下が自動追加されているか確認:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `KV_REST_API_READ_ONLY_TOKEN`

---

### ステップ2: Resend アカウント作成（10分）

**手順:**
1. https://resend.com にアクセス
2. **Sign Up** をクリック
3. メールアドレスとパスワードを入力（Googleアカウントでも可）
4. 確認メールが届く → リンクをクリックして認証
5. ダッシュボードにログイン

---

### ステップ3: Resend APIキー取得（5分）

**手順:**
1. Resend Dashboard → **API Keys** をクリック
2. **Create API Key** をクリック
3. 名前: `todo_app_production` （任意）
4. Permission: **Full Access** を選択
5. **Create** をクリック
6. **APIキーをコピー**（例: `re_123456789abcdef`）
   - ⚠️ **重要**: このキーは1回しか表示されないので、必ずコピーして保存

---

### ステップ4: Resend ドメイン設定（10分）

**オプション1: 即利用（推奨・簡単）**
- デフォルトで `onboarding@resend.dev` ドメインが使える
- 設定不要、すぐにメール送信可能
- ただし「from: onboarding@resend.dev」になる

**オプション2: 独自ドメイン（本格的・後回しOK）**
- 独自ドメイン（例: `noreply@yourdomain.com`）を使う場合
- DNS設定が必要（15分程度）
- 今回はスキップして、まず `resend.dev` で動作確認推奨

**→ 今回は オプション1（resend.dev）で進める**

---

### ステップ5: Vercel環境変数設定（10分）

**手順:**
1. Vercel Dashboard → プロジェクト `todo_app` → **Settings** → **Environment Variables**
2. 以下を追加:

| 変数名 | 値 | 適用環境 |
|--------|---|---------|
| `RESEND_API_KEY` | （ステップ3でコピーしたAPIキー） | Production, Preview, Development |

3. **Save** をクリック

**確認:**
- 現在の環境変数一覧:
  - ✅ `GEMINI_API_KEY` （既存）
  - ✅ `KV_REST_API_URL` （自動追加）
  - ✅ `KV_REST_API_TOKEN` （自動追加）
  - ✅ `RESEND_API_KEY` （今追加）

---

## 5. 第2段階：プログラミング（詳細設計）

### 5.1 依存関係インストール

```bash
npm install @vercel/kv resend
```

**パッケージ説明:**
- `@vercel/kv`: Vercel KVのSDK
- `resend`: Resendのメール送信SDK

---

### 5.2 ファイル構成

```
project/
├── api/
│   ├── auth/
│   │   ├── send-code.mjs       # 認証コード送信
│   │   └── verify-code.mjs     # 認証コード検証
│   └── tasks/
│       ├── save.mjs            # タスク保存
│       └── load.mjs            # タスク読み込み
├── src/
│   ├── components/
│   │   └── LoginModal.jsx      # ログインモーダル（新規）
│   ├── utils/
│   │   └── auth.js             # 認証ヘルパー（新規）
│   └── App.jsx                 # 既存ファイル改修
└── package.json
```

---

### 5.3 API設計

#### API 1: `/api/auth/send-code`

**機能:** メールアドレスに認証コードを送信

**リクエスト:**
```json
POST /api/auth/send-code
{
  "email": "user@example.com"
}
```

**レスポンス（成功）:**
```json
{
  "success": true,
  "message": "認証コードを送信しました"
}
```

**処理フロー:**
1. メールアドレスのバリデーション
2. 6桁ランダムコード生成（100000〜999999）
3. Vercel KVに保存（有効期限5分）
   - キー: `authcode:{email}`
   - 値: `{code}`
   - TTL: 300秒
4. Resend経由でメール送信

---

#### API 2: `/api/auth/verify-code`

**機能:** 認証コードを検証

**リクエスト:**
```json
POST /api/auth/verify-code
{
  "email": "user@example.com",
  "code": "123456"
}
```

**レスポンス（成功）:**
```json
{
  "success": true,
  "userId": "user@example.com"
}
```

**レスポンス（失敗）:**
```json
{
  "success": false,
  "error": "認証コードが正しくありません"
}
```

**処理フロー:**
1. Vercel KVから認証コード取得
2. 入力コードと比較
3. 一致したら成功、userId（メールアドレス）を返す
4. 一致しなかったらエラー

---

#### API 3: `/api/tasks/save`

**機能:** タスクをVercel KVに保存

**リクエスト:**
```json
POST /api/tasks/save
{
  "userId": "user@example.com",
  "tasks": [ /* タスク配列 */ ],
  "tags": [ /* タグ配列 */ ],
  "tagOrder": [ /* タグ順序配列 */ ]
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "保存しました"
}
```

**処理フロー:**
1. userIdの検証
2. Vercel KVに保存
   - キー: `tasks:{userId}`
   - 値: `{ tasks, tags, tagOrder, updatedAt }`

---

#### API 4: `/api/tasks/load`

**機能:** タスクをVercel KVから読み込み

**リクエスト:**
```json
POST /api/tasks/load
{
  "userId": "user@example.com"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "tasks": [ /* タスク配列 */ ],
    "tags": [ /* タグ配列 */ ],
    "tagOrder": [ /* タグ順序配列 */ ],
    "updatedAt": "2026-01-11T12:34:56.789Z"
  }
}
```

---

### 5.4 フロントエンド設計

#### ログインフロー

```
アプリ起動
  ↓
localStorageに userId があるか？
  ├─ YES → タスク読み込み（/api/tasks/load）
  └─ NO → ログインモーダル表示
              ↓
        メールアドレス入力
              ↓
        /api/auth/send-code 呼び出し
              ↓
        認証コード入力画面
              ↓
        /api/auth/verify-code 呼び出し
              ↓
        成功 → userId を localStorage に保存
              ↓
        タスク読み込み
```

#### データ同期ロジック

**現在の localStorage 保存:**
```javascript
// 削除
await window.storage.set('tasks', JSON.stringify(tasks));
```

**新しい Vercel KV 保存:**
```javascript
// src/App.jsx
const saveTasks = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  await fetch('/api/tasks/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      tasks,
      tags,
      tagOrder
    })
  });
};
```

---

## 6. 第3段階：デプロイ・検証

### デプロイ手順
```bash
git add .
git commit -m "feat: Add Vercel KV + email auth

- Add email authentication with Resend
- Migrate from localStorage to Vercel KV
- Support multi-device sync

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

### 検証項目
1. ✅ ログインモーダルが表示されるか
2. ✅ メールに認証コードが届くか
3. ✅ 認証コードでログイン成功するか
4. ✅ タスクがVercel KVに保存されるか
5. ✅ 別のブラウザで同じメールでログイン → 同じデータが見えるか

---

## 7. 作業の優先順位まとめ

### 今すぐやること（順番厳守）

**優先度1: アカウント取得（ユーザーが実施）**
1. Vercel KV 有効化（5分）
2. Resend アカウント作成（10分）
3. Resend APIキー取得（5分）
4. Vercel環境変数設定（10分）

**優先度2: 実装準備確認（Claude が待機）**
- ユーザーがアカウント取得完了後、「準備できました」と報告
- APIキーが正しく設定されているか確認

**優先度3: プログラミング（Claude が実装）**
- 依存関係インストール
- APIファイル作成
- フロントエンド改修
- テスト

**優先度4: デプロイ・検証（一緒に確認）**
- Git push
- 本番環境テスト

---

## 8. ユーザーへのアクションアイテム

### 今すぐ実施すること

1. **Vercel Dashboard にアクセス**
   - https://vercel.com/dashboard
   - プロジェクト `todo_app` → **Storage** → **Create Database** → **KV**

2. **Resend にアクセス**
   - https://resend.com
   - アカウント作成 → APIキー取得

3. **完了したら報告**
   - 「Vercel KV と Resend の準備ができました」
   - または途中で困ったことがあれば質問

---

## 9. メール認証の仕組み（技術的詳細）

### 認証フロー

```javascript
// 1. 認証コード生成（6桁ランダム）
const code = Math.floor(100000 + Math.random() * 900000); // 例: 123456

// 2. Vercel KVに5分間保存
await kv.set(`authcode:${email}`, code, { ex: 300 }); // 300秒 = 5分

// 3. Resend経由でメール送信
await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: email,
  subject: 'タスク管理アプリのログインコード',
  text: `あなたのログインコードは ${code} です`
});

// 4. ユーザーがコード入力後、検証
const storedCode = await kv.get(`authcode:${email}`);
if (storedCode === inputCode) {
  // ログイン成功！
  localStorage.setItem('userId', email);
}
```

### Vercel KVのキー構造

```
Vercel KV:
  ├─ tasks:alice@example.com → Aさんのタスク
  ├─ tasks:bob@example.com → Bさんのタスク
  ├─ authcode:alice@example.com → Aさんの認証コード（5分で自動削除）
  └─ authcode:bob@example.com → Bさんの認証コード（5分で自動削除）
```

---

## 10. 必要なサービス・登録まとめ

| サービス | 用途 | 料金 | 登録難易度 |
|---------|------|------|-----------|
| **Vercel** | ホスティング + API | 無料 | ⭐（既に使用中） |
| **Vercel KV** | データベース | 無料（30k req/月） | ⭐ |
| **Resend** | メール送信 | 無料（3k通/月） | ⭐ |

→ **全て無料枠で運用可能！**

---

## 11. メリット・デメリット

### ✅ メリット
1. **複数デバイス完全同期**: PC・スマホ・タブレット全てで同じデータ
2. **パスワード不要**: メールに届くコードだけでログイン
3. **データ復旧簡単**: メールアドレスさえ覚えていればOK
4. **セキュリティ**: メール認証は銀行アプリでも使われる安全な方式
5. **完全無料**: 個人利用なら全て無料枠で運用可能

### ⚠️ デメリット
1. **初回ログインが必要**: 新しいデバイスで毎回メール認証
2. **メールが届かないと使えない**: スパムフォルダ確認など必要
3. **Resend登録が必要**: 追加で1つサービス登録

---

## 12. データ移行戦略

### 既存のlocalStorageデータの扱い

**方法1: 自動移行（推奨）**
```javascript
// 初回ログイン時、localStorageのデータをVercel KVに自動アップロード
const migrateLocalData = async (userId) => {
  const localTasks = localStorage.getItem('tasks');
  if (localTasks) {
    await fetch('/api/tasks/save', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        tasks: JSON.parse(localTasks),
        tags: [...],
        tagOrder: [...]
      })
    });
    // 移行完了後、localStorageをクリア
    localStorage.removeItem('tasks');
  }
};
```

**方法2: 手動移行（バックアップ機能追加）**
- 設定画面に「データをエクスポート」ボタンを追加
- JSON形式でダウンロード
- ログイン後、「データをインポート」で復元

→ **今回は方法1（自動移行）を実装**

---

## 13. セキュリティ考慮事項

### 実装する対策
1. ✅ メールアドレスのバリデーション（正規表現チェック）
2. ✅ 認証コードの有効期限（5分）
3. ✅ レートリミット（同一メールアドレスへの送信は1分に1回まで）
4. ✅ APIキーはサーバー側のみ（Vercel環境変数）

### 実装しない対策（将来の拡張で検討）
- ⚠️ ブルートフォース攻撃対策（3回失敗でロック）
- ⚠️ CAPTCHA（ボット対策）
- ⚠️ 2要素認証（より高度なセキュリティ）

→ **個人利用のため、まずは基本的な対策のみ実装**

---

## 14. ロールバック戦略

### 問題発生時の対処法

**レベル1: メール認証のみ無効化**
- ログインモーダルを非表示
- ランダムIDで一時的に運用

**レベル2: localStorage に戻す**
- Vercel KV API呼び出しをコメントアウト
- 既存のlocalStorage保存ロジックに戻す

**レベル3: 完全ロールバック**
```bash
git revert HEAD
git push origin main
```

---

この計画書に沿って、準備が整い次第実装を開始します。
