import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken } = req.body;

    // セッショントークン検証
    if (!sessionToken) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const email = await redis.get(`session:${sessionToken}`);
    if (!email) {
      return res.status(401).json({ error: 'セッションが無効です。再ログインしてください' });
    }

    // データ取得
    const rawData = await redis.get(`tasks:${email}`);

    // データがない場合は空データを返す
    if (!rawData) {
      return res.status(200).json({
        success: true,
        data: {
          tasks: [],
          tags: [],
          tagOrder: [],
          routineTasks: [],
          schedules: []
        }
      });
    }

    // 文字列の場合はパース、オブジェクトの場合はそのまま使用
    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Load tasks error:', error);
    return res.status(500).json({ error: 'データの読み込みに失敗しました' });
  }
}
