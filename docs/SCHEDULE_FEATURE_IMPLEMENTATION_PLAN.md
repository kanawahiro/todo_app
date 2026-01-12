# スケジュール抽出・表示機能 実装プラン

## Goal Description
AIタスク抽出機能（Gemini API）を拡張し、ユーザーが入力したテキストから「会議」や「打ち合わせ」などの時間指定のあるイベントを「スケジュール」として別枠で抽出します。
抽出されたスケジュールは、「今日のタスク」タブの最上部に時系列で表示し、通常のタスクリストと区別して確認できるようにします。
**デザイン方針**: 既存のアプリデザイン（クリーム色テーマ）を維持し、違和感のないように追加します。レイアウトの大幅な変更（サイドバー化など）は行いません。

## Mockup
「今日のタスク」タブの上部に、スケジュールセクションを追加します。

![Schedule Mockup](C:/Users/kg_zk/.gemini/antigravity/brain/15d955d5-3e41-4438-a7d8-b55afb421336/schedule_feature_mockup_light_1768176533315.png)

## User Review Required
> [!NOTE]
> `api/extract-tasks.mjs` のプロンプトを変更し、出力形式を変更します。既存のAPI連携部分に影響があります。

## Proposed Changes

### Backend (API)
#### [MODIFY] [extract-tasks.mjs](file:///c:/Users/kg_zk/OneDrive/ドキュメント/GitHub/todo_app/api/extract-tasks.mjs)
- `schedule` と `tasks` の2つの配列を返すように変更します。
```javascript
{
  "schedule": [{"time": "10:00", "event": "チームミーティング"}],
  "tasks": [ ... ]
}
```

### Frontend (Logic)
#### [MODIFY] [App.jsx](file:///c:/Users/kg_zk/OneDrive/ドキュメント/GitHub/todo_app/src/App.jsx)
- `schedule` state を追加 (`useState([])`)。
- `extractTasks`関数を修正し、APIレスポンスから `schedule` を取り出して state に保存する処理を追加。
- `TodayTab` コンポーネントに `schedule` データを受け渡す。

### Frontend (UI)
#### [MODIFY] [components/AppTabs.jsx](file:///c:/Users/kg_zk/OneDrive/ドキュメント/GitHub/todo_app/src/components/AppTabs.jsx)
- `TodayTab` コンポーネントにスケジュールのレンダリングロジックを追加。
- **配置**: タスクカラム（TagColumn）の上部。
- **デザイン**:
  - 横並び（スペースが足りない場合は折り返し）のコンパクトなカード表示。
  - 各カードには「時刻」と「イベント名」を表示。
  - アプリの既存スタイル（少し丸みのある白カード、シャドウ付き）を踏襲。

## Verification Plan

### Manual Verification
1. **アプリ動作確認**:
   - 既存のタブ切り替えやタスク登録が正常に動作すること。
2. **スケジュール抽出**:
   - 入力欄に「13時にランチミーティング。そのあと報告書作成」と入力して抽出。
   - 「今日のスケジュール」欄に「13:00 ランチミーティング」が表示されること。
   - 通常タスク欄に「報告書作成」が表示されること。
