# AIタスク抽出時の見積もり時間反映プラン

## Goal Description
AIによるタスク抽出（Gemini API）において、ユーザーが入力した見積もり時間（例：「30分程度」）が、抽出されたタスクの「見積（estimatedMinutes）」フィールドに反映されない問題を修正します。
現在はAPIが正しく時間を返しているにもかかわらず、フロントエンド側で強制的に `0` にリセットしている箇所があります。

## User Review Required
> [!NOTE]
> この変更は `src/App.jsx` のロジック修正のみを含みます。API側の変更はありません。

## Proposed Changes

### Frontend Component
#### [MODIFY] [App.jsx](file:///c:/Users/kg_zk/OneDrive/ドキュメント/GitHub/todo_app/src/App.jsx)
- `extractTasks`関数内の `setExtracted` の処理を修正し、APIから返却された `estimatedMinutes` を利用するように変更します。

```javascript
// Before
setExtracted(data.tasks.map((t, i) => ({
  ...t,
  tid: Date.now() + i,
  estimatedMinutes: 0 // ここで0にリセットされていた
})));

// After
setExtracted(data.tasks.map((t, i) => ({
  ...t,
  tid: Date.now() + i,
  estimatedMinutes: t.estimatedMinutes || 0 // APIの返却値を優先
})));
```

## Verification Plan

### Manual Verification
1. アプリケーションを起動 (`npm run dev`)
2. 「タスクを入力」欄に以下のような時間を含むテキストを入力
   ```
   30分で相場分析を行います。
   掃除を20分程度で行います。
   ```
3. 「タスクを抽出」ボタンをクリック
4. 抽出されたタスクリストの「見積」欄を確認
   - "相場分析" の見積が `30` 分になっていること
   - "掃除" の見積が `20` 分になっていること
   - （修正前はここが `0` 分になっていた）
