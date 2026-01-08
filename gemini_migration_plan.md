# Anthropic Claude から Google Gemini API への移行プラン

現在の AnthropicClaude API (Claude 3.5 Sonnet) を使用している箇所を、Google Gemini API に変更します。Gemini API を使用することで、Google アカウントの API キーを活用した実装が可能になります。

## Proposed Changes

### 1. 依存関係の追加
Google Gemini API をフロントエンドから安全かつ簡単に呼び出すために、公式の JS SDK を導入します。

- **[NEW]** `@google/generative-ai` ライブラリのインストール

### 2. 環境変数の更新
APIキーの名前を Gemini 用に変更し、`.env.example` を更新します。

- **[MODIFY]** [.env.example](file:///c:/Users/kg_zk/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/GitHub/todo_app/.env.example)
    - `VITE_ANTHROPIC_API_KEY` を `VITE_GEMINI_API_KEY` に変更。

### 3. エントリポイントの修正
環境変数の読み込み箇所を修正します。

- **[MODIFY]** [src/main.jsx](file:///c:/Users/kg_zk/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/GitHub/todo_app/src/main.jsx)
    - 取得する環境変数名を `VITE_GEMINI_API_KEY` に変更。

### 4. アプリケーションロジックの修正
`src/App.jsx` 内の AI 呼び出し部分を、Gemini SDK を使用した最新の実装に書き換えます。

- **[MODIFY]** [src/App.jsx](file:///c:/Users/kg_zk/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/GitHub/todo_app/src/App.jsx)
    - `GoogleGenerativeAI` のインポート追加。
    - **`extractTasks` 関数 (タスク抽出)**:
        - Claude の `fetch` API 形式から、Gemini SDK の `generateContent` に変更。
        - **JSON 形式の強制**: Gemini 3.0 の `responseMimeType: "application/json"` を使用して、パースエラーを防ぎます。
        - プロンプトは現在のものを継承しつつ、Gemini に最適化します。
    - **`generateReview` 関数 (AI振り返り)**:
        - 同じく Gemini SDK を使用した形式に修正。
        - 期間、完了数、総数を基にした分析プロンプトを Gemini に送信します。
    - **定数変更**:
        - `CLAUDE_MODEL` を `gemini-3-flash` に変更。
        - Claude 固有のヘッダー（`anthropic-version` 等）に関連するロジックを削除。

## ユーザーによる準備作業 (重要)
1. **APIキーの設定**: プロジェクト直下に `.env` ファイルを作成（または `.env.example` をコピー）し、以下の行を追加してください。
   ```env
   VITE_GEMINI_API_KEY=あなたの取得したAPIキー
   ```
   > [!WARNING]
   > APIキーはソースコードに直接書かず、必ず `.env` ファイルに記述してください。

## Verification Plan

### Automated Tests
- `npm run dev` でアプリを起動し、ビルドエラーがないことを確認。

### Manual Verification
1. **タスク抽出機能のテスト**:
    - 「登録」タブでテキストを入力し、「AIで抽出」をクリックしてタスクが正しくリスト化されるか確認。
    - 特に JSON パースエラーが起きないか、Gemini のレスポンス形式が適合しているかを確認。
2. **振り返り生成機能のテスト**:
    - 「振り返り」タブで「AI分析を生成」をクリックし、期待通りのフォーマット（よかった点、改善点、提案）で出力されるか確認。

> [!IMPORTANT]
> Gemini API キーは [Google AI Studio](https://aistudio.google.com/) から取得する必要があります。
