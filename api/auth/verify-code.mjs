import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// メールアドレスのバリデーション
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
    const { email, code } = req.body;

    // バリデーション
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: '有効なメールアドレスを入力してください' });
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: '6桁の認証コードを入力してください' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 失敗回数チェック（5回でロック）
    const attempts = await redis.get(`authcode_attempts:${normalizedEmail}`);
    if (attempts && parseInt(attempts) >= 5) {
      return res.status(429).json({
        error: 'ロック中です。15分後に再試行してください'
      });
    }

    // 認証コード検証
    const storedCode = await redis.get(`authcode:${normalizedEmail}`);

    if (!storedCode || storedCode !== code) {
      // 失敗回数インクリメント
      await redis.incr(`authcode_attempts:${normalizedEmail}`);
      await redis.expire(`authcode_attempts:${normalizedEmail}`, 900); // 15分

      return res.status(401).json({ error: '認証コードが正しくありません' });
    }

    // 認証成功 → セッショントークン生成
    const sessionToken = crypto.randomUUID();

    // セッション保存（30日TTL）
    await redis.set(`session:${sessionToken}`, normalizedEmail, { ex: 2592000 });

    // 認証コード削除（使い捨て）
    await redis.del(`authcode:${normalizedEmail}`);
    await redis.del(`authcode_attempts:${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      sessionToken
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ error: '認証に失敗しました' });
  }
}
