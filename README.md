# タスク管理アプリ

React + Viteで構築されたタスク管理アプリケーションです。

## 機能

- ✅ タスクの登録・編集・削除
- 🏷️ タグによるタスク分類
- ⏱️ 作業時間の自動計測
- 📅 カレンダービューでの作業履歴確認
- 🤖 Anthropic Claude AIによるタスク抽出と振り返り機能
- 📊 データベースビューでのタスク検索・フィルタリング

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（オプション）

AI機能を使用する場合は、Anthropic Claude APIキーが必要です。

APIキーは [Anthropic Console](https://console.anthropic.com/) から取得できます。

```bash
# .env.example を .env にコピー
cp .env.example .env

# .env ファイルを編集してAPIキーを設定
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 が自動的に開きます。

## ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## プロジェクト構成

```
todo_app/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── AddSessionForm.jsx
│   │   ├── AppTabs.jsx
│   │   ├── DayCalendarCard.jsx
│   │   ├── TagColumn.jsx
│   │   ├── TaskCard.jsx
│   │   ├── WorkSessionItem.jsx
│   │   └── WorkSessionList.jsx
│   ├── constants/          # 定数定義
│   │   └── tagColors.js
│   ├── utils/              # ユーティリティ関数
│   │   └── formatters.js
│   ├── styles/             # スタイル定義
│   │   └── styles.js
│   ├── App.jsx             # メインアプリケーション
│   └── main.jsx            # エントリーポイント
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 使い方

### タスクの登録

1. **📝 登録**タブを開く
2. テキストエリアにタスクを入力（AIを使う場合は自然な文章でも可）
3. 「タスクを抽出」ボタンをクリック
4. 抽出されたタスクを確認・編集
5. 「登録する」ボタンでタスクを登録

### 作業時間の計測

1. **⏱️ 今日**タブでタスクを確認
2. 「▶ 開始」ボタンで作業開始
3. 「⏸ 中断」または「✓ 完了」で作業終了
4. 作業時間は自動的に記録されます

### カレンダービュー

**📅 カレンダー**タブで過去7日間の作業履歴をタイムライン形式で確認できます。

### タスクの検索

**📊 DB**タブでは、タグ・状態・日付範囲などでタスクをフィルタリングできます。

### 振り返り

**📈 振り返り**タブでは、週次・月次の作業実績を確認できます。AI機能を有効にしている場合は、自動的に振り返りコメントを生成できます。

## データストレージ

タスクデータは`window.storage` APIを使用してローカルに保存されます。ブラウザのローカルストレージまたはElectronのストレージに保存されます。

## ライセンス

MIT
