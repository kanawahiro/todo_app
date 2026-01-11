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
    const { period, totalCount, completedCount } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Gemini AI初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL
    });

    const prompt = `タスク振り返り。期間:${period === 'week' ? '1週間' : '1ヶ月'}。総数:${totalCount}件、完了:${completedCount}件。形式:\n【よかった点】\n・\n【改善点】\n・\n【次への提案】\n・`;

    // Gemini API呼び出し（Text Mode）
    const result = await model.generateContent(prompt);

    // レスポンス取得
    const response = await result.response;
    let text = response.text();

    // マークダウンコードブロック除去（念のため）
    text = text.replace(/```markdown/g, '').replace(/```/g, '').trim();

    // 使用量情報取得
    const usageMetadata = response.usageMetadata || {};

    return res.status(200).json({
      success: true,
      review: text,
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
