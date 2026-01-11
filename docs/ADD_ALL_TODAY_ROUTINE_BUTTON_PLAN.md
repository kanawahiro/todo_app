# 「今日のルーティンタスク一括追加」ボタン実装計画

## 概要

RoutineTaskManagerに「今日のルーティンタスクをすべて追加する」ボタンを追加し、現在の曜日に該当する全てのルーティンタスクを「今日のタスク」タブに一括コピーする機能を実装する。

## 目的

- ユーザーが毎日のルーティンタスクを手動で選択する手間を削減
- ワンクリックで今日実施すべき全ルーティンタスクを登録
- 既存の複数選択機能を補完する機能

## UI配置

### ボタン配置場所

```
📅 ルーティンタスク                [今日の予定をすべて追加]
                                   ↑ ここに配置（h3の横）

✨今日のタスク (月曜日)
  □ 相場分析
  □ メール確認

その他
  □ ジム
  □ 週次レポート
```

### ボタン表示条件

- **表示する場合**: `todayTasks.length > 0` (今日のタスクが1件以上ある)
- **非表示の場合**: `todayTasks.length === 0` (今日のタスクがない)

### ボタンテキスト候補

以下の候補から選定（「今日」という単語の重複を避ける工夫）:

1. ✅ **「今日の予定をすべて追加」** (推奨)
   - 理由: 「予定」という言葉で「ルーティンタスク」と「タスク」の区別がつく
   - シンプルで理解しやすい

2. 「本日分を一括登録」
   - フォーマルだが少し硬い

3. 「この曜日のタスクを追加」
   - 曜日ベースであることが明確だが、やや長い

4. 「すべて追加 (月曜日分)」
   - 現在の曜日を動的に表示
   - わかりやすいが長くなる

**決定**: 「今日の予定をすべて追加」を採用

## データフロー

```
[ボタンクリック]
    ↓
RoutineTaskManager.handleAddAllToday()
    ↓
todayTasks.map(t => t.id) → IDの配列を生成
    ↓
onAddMultipleToToday(todayTaskIds)
    ↓
App.addMultipleRoutineTasksToToday()
    ↓
各ルーティンタスクを今日のタスクとして新規作成
    ↓
setTab('today') → 今日のタスクタブに自動遷移
```

## 実装内容

### 1. RoutineTaskManager.jsx の変更

#### 追加するハンドラー関数

```javascript
const handleAddAllToday = () => {
  if (todayTasks.length === 0) return;
  const todayTaskIds = todayTasks.map(t => t.id);
  onAddMultipleToToday(todayTaskIds);
};
```

#### UIの変更（routineHeaderセクション）

変更前:
```javascript
<div style={styles.routineHeader}>
  <h3>📅 ルーティンタスク</h3>
  {selectedIds.size > 0 && (
    <button ...>✓ 選択したタスクを今日に追加 ({selectedIds.size}件)</button>
  )}
</div>
```

変更後:
```javascript
<div style={styles.routineHeader}>
  <h3>📅 ルーティンタスク</h3>
  <div style={{ display: 'flex', gap: '8px' }}>
    {todayTasks.length > 0 && (
      <button
        onClick={handleAddAllToday}
        style={{
          ...styles.btn,
          background: '#10b981',
          marginTop: 0,
          fontSize: '0.85rem'
        }}
      >
        ✨ 今日の予定をすべて追加
      </button>
    )}
    {selectedIds.size > 0 && (
      <button
        onClick={handleAddMultiple}
        style={{
          ...styles.btn,
          background: '#22c55e',
          marginTop: 0,
          fontSize: '0.85rem'
        }}
      >
        ✓ 選択したタスクを今日に追加 ({selectedIds.size}件)
      </button>
    )}
  </div>
</div>
```

### 2. styles.js への追加（必要に応じて）

現状の `styles.routineHeader` で対応可能。必要に応じて以下を追加:

```javascript
routineHeaderActions: {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap'
}
```

## UI/UX考慮事項

### ボタンの優先順位

1. **「今日の予定をすべて追加」ボタン**: 緑系統の色 (`#10b981`)
   - より一般的な操作として左側に配置
   - 今日のタスクがある場合のみ表示

2. **「選択したタスクを今日に追加」ボタン**: より明るい緑 (`#22c55e`)
   - 選択がある場合のみ表示
   - 右側に配置

### 確認ダイアログ

**不要と判断**

理由:
- 既存の「選択したタスクを今日に追加」にも確認ダイアログがない
- 誤操作のリスクは低い（タスクタブで削除可能）
- スムーズな操作性を優先

必要に応じて後から追加可能。

### レスポンシブ対応

`flexWrap: 'wrap'` により、画面幅が狭い場合は2つのボタンが縦に並ぶ。

## 既存機能との関係

### 重複チェックは不要

理由:
- 既存の `addMultipleRoutineTasksToToday` は重複チェックなしで新規タスクを作成
- 同じルーティンタスクを複数回追加することも想定内（例: 1日に2回ジムに行くなど）
- ユーザーが不要な場合は手動で削除可能

### 選択状態のクリア

「今日の予定をすべて追加」実行後も、チェックボックスの選択状態は保持。

理由:
- 既存の「選択したタスクを今日に追加」と挙動を統一
- ユーザーが明示的に解除するまで選択を維持

## テストシナリオ

### 正常系

1. **基本動作**
   - 月曜日に「月」タグのタスク2件がある状態
   - ボタンをクリック
   - 「今日のタスク」タブに2件のタスクが追加される
   - タブが自動的に「今日のタスク」に切り替わる

2. **タグの継承**
   - ルーティンタスクに設定されたタグが、コピー後のタスクにも設定される

3. **見積もり時間の継承**
   - estimatedMinutes が正しくコピーされる

### エッジケース

1. **今日のタスクが0件**
   - ボタンが表示されない

2. **今日のタスクが1件**
   - ボタンが表示され、正常に動作

3. **毎日タスクのみ**
   - 「毎日」タグのみのタスクも正常に追加

4. **複数回実行**
   - 同じタスクが重複して追加される（仕様通り）

## 実装順序

1. RoutineTaskManager.jsx に `handleAddAllToday` 関数を追加
2. routineHeader の JSX を変更（ボタン追加、レイアウト調整）
3. 動作確認
   - 各曜日でのボタン表示/非表示
   - クリック時の動作
   - タブ遷移
   - データの正確性

## 影響範囲

### 変更が必要なファイル

- `src/components/RoutineTaskManager.jsx` (主な変更)

### 変更不要なファイル

- `src/App.jsx` (既存の `addMultipleRoutineTasksToToday` を使用)
- `src/styles/styles.js` (既存のスタイルで対応可能)
- `src/components/AppTabs.jsx` (変更不要)

## まとめ

この実装により:
- ユーザーは今日実施すべきルーティンタスクを**ワンクリック**で登録可能
- 既存の「複数選択 + 追加」機能と**共存**
- UIは直感的でシンプル
- 実装コストは最小限（1ファイルのみ変更）
