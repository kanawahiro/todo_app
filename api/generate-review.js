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
    const { period, totalCount, completedCount } = req.body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `タスク振り返り。期間:${period === 'week' ? '1週間' : '1ヶ月'}。総数:${totalCount}件、完了:${completedCount}件。形式:\n【よかった点】\n・\n【改善点】\n・\n【次への提案】\n・`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text;
    // Markdownのコードブロックが含まれている場合の除去
    text = text.replace(/```markdown/g, '').replace(/```/g, '').trim();

    return res.status(200).json({
      success: true,
      review: text,
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
