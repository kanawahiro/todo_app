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
    const { sessionToken, tasks, tags, tagOrder, routineTasks, schedules } = req.body;

    // セッショントークン検証
    if (!sessionToken) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const email = await redis.get(`session:${sessionToken}`);
    if (!email) {
      return res.status(401).json({ error: 'セッションが無効です。再ログインしてください' });
    }

    // データバリデーション
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: '不正なデータ形式です' });
    }

    // データ保存
    const data = {
      tasks: tasks || [],
      tags: tags || [],
      tagOrder: tagOrder || [],
      routineTasks: routineTasks || [],
      schedules: schedules || [],
      updatedAt: new Date().toISOString()
    };

    await redis.set(`tasks:${email}`, JSON.stringify(data));

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Save tasks error:', error);
    return res.status(500).json({ error: 'データの保存に失敗しました' });
  }
}
