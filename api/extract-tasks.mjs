import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = 'gemini-3-flash-preview';

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Gemini AI初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL
    });

    const prompt = `あなたはタスク管理アシスタントです。入力テキストからタスクを抽出してJSON配列で出力してください。

【最重要ルール】
- "name"フィールドは必ず15文字以内の簡潔な動詞句にする
- 詳細情報は全て"memo"フィールドに入れる
- 「まず」「次に」「それから」「今日」などの接続詞・時間表現は削除する
- タスクの所要時間が推測できる場合は"estimatedMinutes"に数値（分単位）を設定

【タスク名（name）の書き方】
- 「〜を確認」「〜に返信」「〜を作成」のような動詞で終わる短い表現
- 数値、期限、条件、詳細は含めない
- 例: "メール返信", "在庫確認", "動画作成", "資料送付"

【メモ（memo）の書き方】
- タスク名に含まれない全ての詳細情報を記載
- 数量、期限、条件、注意事項、補足説明など
- 該当なしの場合のみ空文字列 ""

【見積もり時間（estimatedMinutes）の設定】
- タスクの内容から推測される所要時間を分単位の数値で設定
- 明示的な時間が書かれている場合はその値を使用
- 推測できない場合や不明な場合は 0 を設定
- 例:
  - "メール返信" → 5〜10分
  - "会議" → 30〜60分
  - "資料作成" → 60〜120分
  - "簡単な確認" → 5分

【入出力例】
入力: "次に派遣のメールに返信を行う。確か商品の素材を記入する必要がある。"
出力: {"name": "派遣メールに返信", "tag": "雑務", "memo": "商品の素材を記入する必要あり", "estimatedMinutes": 10}

入力: "会津にリスト26箱を出します。在庫切れで早めに欲しい商品があれば確認"
出力: {"name": "会津にリスト出し", "tag": "受注発送関連", "memo": "26箱、在庫切れで早めに欲しい商品を確認", "estimatedMinutes": 30}

入力: "在庫の計算の方法を動画にしてまとめる。これは標準になって綾さんに伝える。"
出力: {"name": "在庫計算動画作成", "tag": "雑務", "memo": "標準化して綾さんに伝える", "estimatedMinutes": 60}

入力: "30分で相場分析をする"
出力: {"name": "相場分析", "tag": "売上アップ", "memo": "", "estimatedMinutes": 30}

【タグの選択肢】: ${tags ? tags.join(', ') : '売上アップ, 雑務, 仕入れ, 広告, 受注発送関連'}

【出力形式】JSON配列のみ。説明文や挨拶は不要。
[{"name": "短いタスク名", "tag": "タグ", "memo": "詳細情報", "estimatedMinutes": 数値}]

入力テキスト:
${input}`;

    // Gemini API呼び出し (JSON Mode使用)
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              tag: { type: "string" },
              memo: { type: "string" },
              estimatedMinutes: { type: "integer" }
            },
            required: ["name", "tag", "memo", "estimatedMinutes"]
          }
        }
      }
    });

    // レスポンス取得
    const response = await result.response;
    const text = response.text();

    // JSON Mode使用時はクリーニング不要、直接パース
    const parsed = JSON.parse(text);

    // 使用量情報取得（オプション）
    const usageMetadata = response.usageMetadata || {};

    return res.status(200).json({
      success: true,
      tasks: parsed,
      usage: {
        input_tokens: usageMetadata.promptTokenCount || 0,
        output_tokens: usageMetadata.candidatesTokenCount || 0
      }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
}
