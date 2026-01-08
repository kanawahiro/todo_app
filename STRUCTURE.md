# プロジェクト構造

このドキュメントでは、コードがどのように分割されているかを説明します。

## ファイル構成

### エントリーポイント
- **index.html** - HTMLエントリーポイント
- **src/main.jsx** - Reactアプリのエントリーポイント

### メインアプリケーション
- **src/App.jsx** (約650行)
  - アプリケーションのメインロジック
  - 状態管理
  - データの読み込み・保存
  - タスク操作関数

### コンポーネント (src/components/)

#### タブコンポーネント
- **AppTabs.jsx** (約600行)
  - RegisterTab - タスク登録タブ
  - TodayTab - 今日のタスク表示タブ
  - CalendarTab - カレンダー表示タブ
  - DatabaseTab - データベース検索タブ
  - ReviewTab - 振り返りタブ

#### タスク関連コンポーネント
- **TaskCard.jsx** (約140行)
  - 個別タスクカード
  - タスク名・メモ・ステータスの編集
  - アクションボタン（開始・中断・完了など）

- **TagColumn.jsx** (約110行)
  - タグごとのタスク列
  - タスクの並び替え
  - 新規タスク追加

#### 作業履歴関連コンポーネント
- **WorkSessionList.jsx** (約130行)
  - 作業セッションのリスト表示
  - セッション追加フォーム表示制御

- **WorkSessionItem.jsx** (約160行)
  - 個別作業セッション表示・編集
  - 開始時刻・終了時刻の編集
  - バリデーション

- **AddSessionForm.jsx** (約120行)
  - 新規作業セッション追加フォーム
  - 時刻入力とバリデーション

#### ビューコンポーネント
- **DayCalendarCard.jsx** (約170行)
  - 1日分のタイムライン表示
  - 作業セッションの可視化

### ユーティリティ・定数 (src/utils/, src/constants/)
- **utils/formatters.js** (約100行)
  - 時間フォーマット関数
  - 日付操作関数
  - バリデーション関数

- **constants/tagColors.js** (約40行)
  - タグカラー定義
  - ステータスカラー定義
  - ステータスアイコン定義

### スタイル (src/styles/)
- **styles/styles.js** (約150行)
  - すべてのスタイル定義
  - CSS-in-JSオブジェクト

## データフロー

```
App.jsx (状態管理)
    ↓
AppTabs.jsx (タブ表示)
    ↓
各タブコンポーネント
    ↓
TagColumn / TaskCard
    ↓
WorkSessionList
    ↓
WorkSessionItem / AddSessionForm
```

## ファイルサイズ概算

| ファイル | 行数 | サイズ | 役割 |
|---------|------|--------|------|
| App.jsx | ~650 | 22KB | メインロジック |
| AppTabs.jsx | ~600 | 21KB | タブUI |
| TaskCard.jsx | ~140 | 5KB | タスク表示 |
| DayCalendarCard.jsx | ~170 | 6KB | カレンダー |
| WorkSessionList.jsx | ~130 | 5KB | セッション管理 |
| WorkSessionItem.jsx | ~160 | 6KB | セッション編集 |
| AddSessionForm.jsx | ~120 | 4KB | セッション追加 |
| TagColumn.jsx | ~110 | 4KB | タグ列 |
| styles.js | ~150 | 5KB | スタイル |
| formatters.js | ~100 | 3KB | ユーティリティ |
| tagColors.js | ~40 | 1KB | 定数 |

**合計**: 約2,370行、約82KB

すべてのファイルが適切なサイズに分割されており、Claude Artifactsの制限内に収まっています。

## 分割の利点

1. **保守性**: 各ファイルが単一の責任を持つ
2. **再利用性**: コンポーネントを他のプロジェクトでも使用可能
3. **テスト性**: 各コンポーネントを個別にテスト可能
4. **可読性**: コードの位置が予測しやすい
5. **サイズ制限対応**: 各ファイルが制限内に収まる

## 依存関係

```
App.jsx
  ├─ components/AppTabs.jsx
  ├─ utils/formatters.js
  └─ styles/styles.js

AppTabs.jsx
  ├─ components/TagColumn.jsx
  ├─ components/DayCalendarCard.jsx
  ├─ constants/tagColors.js
  ├─ utils/formatters.js
  └─ styles/styles.js

TagColumn.jsx
  ├─ components/TaskCard.jsx
  └─ styles/styles.js

TaskCard.jsx
  ├─ components/WorkSessionList.jsx
  ├─ constants/tagColors.js
  ├─ utils/formatters.js
  └─ styles/styles.js

WorkSessionList.jsx
  ├─ components/WorkSessionItem.jsx
  ├─ components/AddSessionForm.jsx
  ├─ utils/formatters.js
  └─ styles/styles.js
```
