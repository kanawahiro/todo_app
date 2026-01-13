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

    const prompt = `あなたはタスク管理アシスタントです。入力テキストから「スケジュール」と「タスク」を抽出してJSONオブジェクトで出力してください。

【スケジュールとタスクの区別】
- **スケジュール**: 時刻指定のあるイベント（会議、打ち合わせ、ミーティング、予定など）
  - 「13時にランチ」「10:00から会議」のように時刻が明記されているもの
  - 時刻がなくても「会議」「打ち合わせ」「ミーティング」などのキーワードがあれば時刻を推測
- **タスク**: 時刻指定のない作業項目（報告書作成、メール返信など）

【スケジュール（schedule）の書き方】
- "start": 開始時刻を "HH:MM" 形式で記載（例: "13:00", "10:30"）
  - 時刻が明記されていない場合は、文脈から推測するか "00:00" を設定
- "event": イベント名を15文字以内の簡潔な名詞句で記載（例: "チームミーティング", "ランチ"）
- "memo": イベントの詳細情報（場所、参加者、議題など）

【タスク（tasks）の書き方】
- "name": 15文字以内の簡潔な動詞句（例: "報告書作成", "メール返信"）
- "tag": タグを選択（選択肢から最も適切なものを選ぶ）
- "memo": 詳細情報
- "estimatedMinutes": 推測される所要時間（分単位の数値）

【入出力例】
入力: "13時にランチミーティング。場所はカフェA。そのあと報告書作成"
出力:
{
  "schedule": [
    {"start": "13:00", "event": "ランチミーティング", "memo": "場所はカフェA"}
  ],
  "tasks": [
    {"name": "報告書作成", "tag": "雑務", "memo": "", "estimatedMinutes": 60}
  ]
}

入力: "10:00からチームミーティング。Zoomリンクは後ほど共有。その後在庫確認を30分でやる"
出力:
{
  "schedule": [
    {"start": "10:00", "event": "チームミーティング", "memo": "Zoomリンクは後ほど共有"}
  ],
  "tasks": [
    {"name": "在庫確認", "tag": "仕入れ", "memo": "", "estimatedMinutes": 30}
  ]
}

入力: "メールに返信して、広告データを確認する"
出力:
{
  "schedule": [],
  "tasks": [
    {"name": "メール返信", "tag": "雑務", "memo": "", "estimatedMinutes": 10},
    {"name": "広告データ確認", "tag": "広告", "memo": "", "estimatedMinutes": 15}
  ]
}

【タグの選択肢】: ${tags ? tags.join(', ') : '売上アップ, 雑務, 仕入れ, 広告, 受注発送関連'}

【出力形式】JSON オブジェクトのみ。説明文や挨拶は不要。
{"schedule": [...], "tasks": [...]}

入力テキスト:
${input}`;

    // Gemini API呼び出し (JSON Mode使用)
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  start: { type: "string" },
                  event: { type: "string" },
                  memo: { type: "string" }
                },
                required: ["start", "event", "memo"]
              }
            },
            tasks: {
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
          },
          required: ["schedule", "tasks"]
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
      schedule: parsed.schedule || [],
      tasks: parsed.tasks || [],
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
