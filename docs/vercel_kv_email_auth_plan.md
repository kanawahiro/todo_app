# Upstash Redis + メール認証 実装計画書（v2）

## 1. 現状確認

### 完了したサービス登録
- ✅ **Vercel** アカウント（todo_app デプロイ済み）
- ✅ **Google AI Studio** アカウント（Gemini API使用中）
- ✅ **Upstash Redis** （Marketplace経由で作成済み）
- ✅ **Resend** アカウント（APIキー取得済み）

### 環境変数（Vercel に設定済み）
- ✅ `GEMINI_API_KEY`
- ✅ `UPSTASH_REDIS_REST_URL`
- ✅ `UPSTASH_REDIS_REST_TOKEN`
- ✅ `RESEND_API_KEY`

---

## 2. 変更点（旧プランからの差分）

| 項目 | 旧プラン | 新プラン |
|------|----------|----------|
| データベース | Vercel KV | **Upstash Redis** |
| SDK | `@vercel/kv` | **`@upstash/redis`** |
| セキュリティ | 基本的な対策 | **セッショントークン方式** |
| 認証チェック | なし | **全APIで認証必須** |

---

## 3. セキュリティ設計（重要）

### 3.1 脆弱性と対策一覧

| 脆弱性 | リスク | 対策 |
|--------|--------|------|
| **セッションハイジャック** | 他人のタスクを閲覧・改ざん | セッショントークン方式を採用 |
| **ブルートフォース攻撃** | 認証コード総当たり | 5回失敗で15分ロック |
| **メール爆撃** | Resend無料枠消費 | 同一メール1分間隔制限 |
| **CSRF** | 不正リクエスト | Same-Origin チェック |
| **XSS** | スクリプト注入 | 入力値サニタイズ |
| **列挙攻撃** | メール存在確認 | 成功/失敗で同じメッセージ |

### 3.2 セッショントークン方式（採用）

**旧プラン（脆弱）:**
```javascript
// ❌ メールアドレスをそのまま保存 → 推測可能
localStorage.setItem('userId', 'user@example.com');

// ❌ APIリクエストも推測可能
fetch('/api/tasks/load', { body: { userId: 'user@example.com' } });
```

**新プラン（安全）:**
```javascript
// ✅ ランダムなセッショントークンを使用
// サーバー側で生成: crypto.randomUUID() → "550e8400-e29b-41d4-a716-446655440000"
localStorage.setItem('sessionToken', '550e8400-e29b-41d4-a716-446655440000');

// ✅ トークンでAPIリクエスト（メールアドレス不要）
fetch('/api/tasks/load', { body: { sessionToken: '550e8400...' } });
```

### 3.3 認証フロー（セキュア版）

```
【認証コード送信】
1. ユーザー: メールアドレス入力
2. サーバー: レートリミットチェック（1分に1回）
3. サーバー: 6桁コード生成 + Redis保存（5分TTL）
4. サーバー: Resend経由でメール送信
5. レスポンス: 常に「送信しました」（メール存在有無を隠す）

【認証コード検証】
1. ユーザー: コード入力
2. サーバー: 失敗回数チェック（5回でロック）
3. サーバー: コード検証
4. 成功時: セッショントークン生成 + Redis保存（30日TTL）
5. レスポンス: セッショントークンを返す
6. クライアント: localStorage に保存

【APIリクエスト】
1. クライアント: sessionToken を送信
2. サーバー: Redis でトークン検証
3. 有効なら処理実行、無効なら 401 エラー
```

---

## 4. Redis キー設計

```
Upstash Redis:
  │
  ├─【認証関連】
  │   ├─ authcode:{email}           → "123456"           TTL: 300秒（5分）
  │   ├─ authcode_attempts:{email}  → 3                  TTL: 900秒（15分）
  │   └─ ratelimit:{email}          → 1705312345000      TTL: 60秒（1分）
  │
  ├─【セッション関連】
  │   ├─ session:{token}            → "user@example.com" TTL: 2592000秒（30日）
  │   └─ sessions:{email}           → ["token1","token2"] TTL: なし
  │
  └─【データ関連】
      └─ tasks:{email}              → { tasks, tags, ... } TTL: なし
```

---

## 5. API設計（セキュア版）

### 5.1 `/api/auth/send-code.mjs`

**リクエスト:**
```json
POST /api/auth/send-code
{ "email": "user@example.com" }
```

**処理フロー:**
```javascript
export default async function handler(req, res) {
  // 1. CORS設定
  // 2. メールアドレスバリデーション（正規表現）
  // 3. レートリミットチェック
  const lastSent = await redis.get(`ratelimit:${email}`);
  if (lastSent && Date.now() - lastSent < 60000) {
    return res.status(429).json({ error: '1分後に再試行してください' });
  }

  // 4. 認証コード生成（暗号学的に安全）
  const code = crypto.randomInt(100000, 999999);

  // 5. Redis保存（5分TTL）
  await redis.set(`authcode:${email}`, code, { ex: 300 });
  await redis.set(`ratelimit:${email}`, Date.now(), { ex: 60 });

  // 6. メール送信
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'タスク管理アプリ - ログインコード',
    html: `<p>あなたのログインコードは <strong>${code}</strong> です。</p>
           <p>このコードは5分間有効です。</p>`
  });

  // 7. 常に成功レスポンス（メール存在有無を隠す）
  return res.status(200).json({ success: true, message: '認証コードを送信しました' });
}
```

---

### 5.2 `/api/auth/verify-code.mjs`

**リクエスト:**
```json
POST /api/auth/verify-code
{ "email": "user@example.com", "code": "123456" }
```

**処理フロー:**
```javascript
export default async function handler(req, res) {
  // 1. 失敗回数チェック
  const attempts = await redis.get(`authcode_attempts:${email}`) || 0;
  if (attempts >= 5) {
    return res.status(429).json({ error: 'ロック中です。15分後に再試行してください' });
  }

  // 2. 認証コード検証
  const storedCode = await redis.get(`authcode:${email}`);
  if (!storedCode || storedCode !== parseInt(code)) {
    // 失敗回数インクリメント
    await redis.incr(`authcode_attempts:${email}`);
    await redis.expire(`authcode_attempts:${email}`, 900); // 15分
    return res.status(401).json({ error: '認証コードが正しくありません' });
  }

  // 3. 認証成功 → セッショントークン生成
  const sessionToken = crypto.randomUUID();

  // 4. セッション保存（30日TTL）
  await redis.set(`session:${sessionToken}`, email, { ex: 2592000 });

  // 5. 認証コード削除（使い捨て）
  await redis.del(`authcode:${email}`);
  await redis.del(`authcode_attempts:${email}`);

  // 6. セッショントークンを返す
  return res.status(200).json({ success: true, sessionToken });
}
```

---

### 5.3 `/api/tasks/save.mjs`

**リクエスト:**
```json
POST /api/tasks/save
{
  "sessionToken": "550e8400-e29b-41d4-a716-446655440000",
  "tasks": [...],
  "tags": [...],
  "tagOrder": [...],
  "routineTasks": [...],
  "schedules": [...]
}
```

**処理フロー:**
```javascript
export default async function handler(req, res) {
  // 1. セッショントークン検証
  const email = await redis.get(`session:${sessionToken}`);
  if (!email) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  // 2. データバリデーション
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: '不正なデータ形式です' });
  }

  // 3. データ保存
  await redis.set(`tasks:${email}`, JSON.stringify({
    tasks,
    tags,
    tagOrder,
    routineTasks,
    schedules,
    updatedAt: new Date().toISOString()
  }));

  return res.status(200).json({ success: true });
}
```

---

### 5.4 `/api/tasks/load.mjs`

**リクエスト:**
```json
POST /api/tasks/load
{ "sessionToken": "550e8400-e29b-41d4-a716-446655440000" }
```

**処理フロー:**
```javascript
export default async function handler(req, res) {
  // 1. セッショントークン検証
  const email = await redis.get(`session:${sessionToken}`);
  if (!email) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  // 2. データ取得
  const data = await redis.get(`tasks:${email}`);

  // 3. データがない場合は空データを返す
  if (!data) {
    return res.status(200).json({
      success: true,
      data: { tasks: [], tags: [], tagOrder: [], routineTasks: [], schedules: [] }
    });
  }

  return res.status(200).json({ success: true, data: JSON.parse(data) });
}
```

---

### 5.5 `/api/auth/logout.mjs`（新規追加）

**リクエスト:**
```json
POST /api/auth/logout
{ "sessionToken": "550e8400-e29b-41d4-a716-446655440000" }
```

**処理フロー:**
```javascript
export default async function handler(req, res) {
  // セッショントークン削除
  await redis.del(`session:${sessionToken}`);
  return res.status(200).json({ success: true });
}
```

---

## 6. フロントエンド設計

### 6.1 新規ファイル

```
src/
├── components/
│   └── LoginModal.jsx      # ログインモーダル（新規）
├── hooks/
│   └── useAuth.js          # 認証カスタムフック（新規）
└── App.jsx                 # 既存ファイル改修
```

### 6.2 LoginModal.jsx

**2段階のUI:**
1. **メールアドレス入力画面**
   - メールアドレス入力欄
   - 「認証コードを送信」ボタン
   - ローディング表示

2. **認証コード入力画面**
   - 6桁コード入力欄
   - 「ログイン」ボタン
   - 「コードを再送信」リンク
   - エラーメッセージ表示

### 6.3 useAuth.js（カスタムフック）

```javascript
export function useAuth() {
  const [sessionToken, setSessionToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初期化時にlocalStorageからトークン読み込み
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      setSessionToken(token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // ログイン
  const login = async (email, code) => { ... };

  // ログアウト
  const logout = async () => {
    await fetch('/api/auth/logout', { ... });
    localStorage.removeItem('sessionToken');
    setSessionToken(null);
    setIsAuthenticated(false);
  };

  return { sessionToken, isLoading, isAuthenticated, login, logout };
}
```

### 6.4 App.jsx 改修

**変更点:**
1. `useAuth` フックを使用
2. 未認証時は `LoginModal` を表示
3. `localStorage` 保存 → API 保存に変更
4. 自動保存のデバウンスはそのまま維持

```javascript
function App() {
  const { sessionToken, isLoading, isAuthenticated, logout } = useAuth();

  // 認証待ち
  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  // 未認証
  if (!isAuthenticated) {
    return <LoginModal onSuccess={() => window.location.reload()} />;
  }

  // 認証済み → 既存のアプリ表示
  return (
    <div>
      {/* ヘッダーにログアウトボタン追加 */}
      <button onClick={logout}>ログアウト</button>
      {/* 既存のタブコンポーネント */}
    </div>
  );
}
```

---

## 7. データ同期ロジック

### 7.1 保存タイミング

**現在（localStorage）:**
- tasks 変更時（500ms デバウンス）
- tags/tagOrder/routineTasks/schedules 変更時（即時）

**新設計（Upstash Redis）:**
- 全データをまとめて保存（500ms デバウンス）
- ネットワークエラー時はローカルにフォールバック

### 7.2 保存関数

```javascript
const saveToCloud = useMemo(() => {
  let timeoutId = null;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        await fetch('/api/tasks/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken,
            tasks,
            tags,
            tagOrder,
            routineTasks,
            schedules
          })
        });
      } catch (error) {
        console.error('保存エラー:', error);
        // フォールバック: localStorage に保存
        localStorage.setItem('tasks_backup', JSON.stringify({ tasks, tags, tagOrder, routineTasks, schedules }));
      }
    }, 500);
  };
}, [sessionToken, tasks, tags, tagOrder, routineTasks, schedules]);

// データ変更時に自動保存
useEffect(() => {
  if (!loading && isAuthenticated) {
    saveToCloud();
  }
}, [tasks, tags, tagOrder, routineTasks, schedules, saveToCloud]);
```

---

## 8. データ移行戦略

### 8.1 自動移行フロー

```
初回ログイン成功
  ↓
localStorage にデータがあるか？
  ├─ YES → クラウドにアップロード
  │         ↓
  │       「既存データを移行しました」表示
  │         ↓
  │       localStorage のデータを削除
  │
  └─ NO → クラウドからデータを読み込み
            ↓
          （初回ユーザーは空データ）
```

### 8.2 移行コード

```javascript
const migrateLocalData = async (sessionToken) => {
  // 古いデータの読み込み
  const localTasks = localStorage.getItem('tasks');
  const localTags = localStorage.getItem('tags');
  const localTagOrder = localStorage.getItem('tagOrder');
  const localRoutineTasks = localStorage.getItem('routineTasks');
  const localSchedules = localStorage.getItem('schedules');

  // データがない場合はスキップ
  if (!localTasks) return false;

  // クラウドに保存
  const response = await fetch('/api/tasks/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionToken,
      tasks: JSON.parse(localTasks || '[]'),
      tags: JSON.parse(localTags || '[]'),
      tagOrder: JSON.parse(localTagOrder || '[]'),
      routineTasks: JSON.parse(localRoutineTasks || '[]'),
      schedules: JSON.parse(localSchedules || '[]')
    })
  });

  if (response.ok) {
    // 移行成功 → 古いデータを削除
    localStorage.removeItem('tasks');
    localStorage.removeItem('tags');
    localStorage.removeItem('tagOrder');
    localStorage.removeItem('routineTasks');
    localStorage.removeItem('schedules');
    return true;
  }

  return false;
};
```

---

## 9. ファイル構成（最終）

```
todo_app/
├── api/
│   ├── auth/
│   │   ├── send-code.mjs       # 認証コード送信
│   │   ├── verify-code.mjs     # 認証コード検証
│   │   └── logout.mjs          # ログアウト
│   ├── tasks/
│   │   ├── save.mjs            # タスク保存
│   │   └── load.mjs            # タスク読み込み
│   ├── extract-tasks.mjs       # 既存（変更なし）
│   └── generate-review.mjs     # 既存（変更なし）
├── src/
│   ├── components/
│   │   ├── LoginModal.jsx      # 新規
│   │   └── ... (既存)
│   ├── hooks/
│   │   └── useAuth.js          # 新規
│   ├── App.jsx                 # 改修
│   └── ... (既存)
└── package.json                # @upstash/redis, resend 追加
```

---

## 10. 依存関係

```bash
npm install @upstash/redis resend
```

**パッケージ:**
- `@upstash/redis`: Upstash Redis SDK
- `resend`: メール送信 SDK

---

## 11. 実装順序

### Phase 1: バックエンド（API）
1. `api/auth/send-code.mjs` - 認証コード送信
2. `api/auth/verify-code.mjs` - 認証コード検証
3. `api/auth/logout.mjs` - ログアウト
4. `api/tasks/save.mjs` - タスク保存
5. `api/tasks/load.mjs` - タスク読み込み

### Phase 2: フロントエンド
1. `src/hooks/useAuth.js` - 認証フック
2. `src/components/LoginModal.jsx` - ログインUI
3. `src/App.jsx` - 改修（認証統合 + クラウド保存）

### Phase 3: テスト・デプロイ
1. ローカルテスト（`npm run dev`）
2. Git commit & push
3. Vercel 自動デプロイ
4. 本番環境テスト

---

## 12. テスト項目

### 認証テスト
- [ ] メールアドレス入力 → 認証コード受信
- [ ] 正しいコードでログイン成功
- [ ] 間違ったコード5回 → ロック
- [ ] 1分以内の再送信 → エラー
- [ ] ログアウト → セッション無効化

### データ同期テスト
- [ ] タスク追加 → クラウドに保存
- [ ] 別ブラウザでログイン → 同じデータ表示
- [ ] オフライン時 → ローカルにフォールバック

### 移行テスト
- [ ] 既存データありでログイン → 自動移行
- [ ] 既存データなしでログイン → 空データ

---

## 13. セキュリティチェックリスト

### 実装する対策
- [x] セッショントークン方式（推測不可能）
- [x] 認証コードの有効期限（5分）
- [x] ブルートフォース対策（5回失敗で15分ロック）
- [x] レートリミット（1分に1回）
- [x] APIキーはサーバー側のみ
- [x] 入力値バリデーション
- [x] エラーメッセージの情報漏洩防止

### 将来の拡張で検討
- [ ] CAPTCHA（ボット対策）
- [ ] IP ベースのレートリミット
- [ ] セッション一覧表示・強制ログアウト
- [ ] 独自ドメインからのメール送信

---

## 14. ロールバック戦略

### 問題発生時の対処

**レベル1: 認証のみ無効化**
```javascript
// App.jsx で認証をスキップ
const SKIP_AUTH = true; // 緊急時のみ true
if (SKIP_AUTH) {
  // 既存の localStorage 方式で動作
}
```

**レベル2: 完全ロールバック**
```bash
git revert HEAD
git push origin main
```

---

## 15. 料金・制限

| サービス | 無料枠 | 今回の想定使用量 |
|---------|--------|-----------------|
| **Upstash Redis** | 10,000 コマンド/日 | 〜100 コマンド/日 |
| **Resend** | 3,000 通/月 | 〜30 通/月 |
| **Vercel** | 100GB 帯域/月 | 〜1GB/月 |

→ **全て無料枠内で運用可能**

---

この計画書に沿って実装を進めます。
質問や修正があれば、実装前にお知らせください。
