import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
const CLAUDE_MAX_TOKENS = 2000;

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, tags } = req.body;

    if (!input || !input.trim()) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `あなたはタスク管理アシスタントです。入力テキストからタスクを抽出してJSON配列で出力してください。

【最重要ルール】
- "name"フィールドは必ず15文字以内の簡潔な動詞句にする
- 詳細情報は全て"memo"フィールドに入れる
- 「まず」「次に」「それから」「今日」などの接続詞・時間表現は削除する

【タスク名（name）の書き方】
- 「〜を確認」「〜に返信」「〜を作成」のような動詞で終わる短い表現
- 数値、期限、条件、詳細は含めない
- 例: "メール返信", "在庫確認", "動画作成", "資料送付"

【メモ（memo）の書き方】
- タスク名に含まれない全ての詳細情報を記載
- 数量、期限、条件、注意事項、補足説明など
- 該当なしの場合のみ空文字列 ""

【入出力例】
入力: "次に派遣のメールに返信を行う。確か商品の素材を記入する必要がある。"
出力: {"name": "派遣メールに返信", "tag": "雑務", "memo": "商品の素材を記入する必要あり"}

入力: "会津にリスト26箱を出します。在庫切れで早めに欲しい商品があれば確認"
出力: {"name": "会津にリスト出し", "tag": "受注発送関連", "memo": "26箱、在庫切れで早めに欲しい商品を確認"}

入力: "在庫の計算の方法を動画にしてまとめる。これは標準になって綾さんに伝える。"
出力: {"name": "在庫計算動画作成", "tag": "雑務", "memo": "標準化して綾さんに伝える"}

【タグの選択肢】: ${tags ? tags.join(', ') : '売上アップ, 雑務, 仕入れ, 広告, 受注発送関連'}

【出力形式】JSON配列のみ。説明文や挨拶は不要。
[{"name": "短いタスク名", "tag": "タグ", "memo": "詳細情報"}]

入力テキスト:
${input}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text;

    // JSONのみを抽出するためのクリーニング
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (match) text = match[0];

    const parsed = JSON.parse(text);

    return res.status(200).json({
      success: true,
      tasks: parsed,
      usage: response.usage
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
}
