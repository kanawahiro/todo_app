import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { email } = req.body;

    // メールアドレスバリデーション
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: '有効なメールアドレスを入力してください' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // レートリミットチェック（1分に1回）
    const lastSent = await redis.get(`ratelimit:${normalizedEmail}`);
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent);
      if (elapsed < 60000) {
        const remaining = Math.ceil((60000 - elapsed) / 1000);
        return res.status(429).json({
          error: `${remaining}秒後に再試行してください`
        });
      }
    }

    // 認証コード生成（6桁）
    const code = crypto.randomInt(100000, 999999).toString();

    // Redis保存（5分TTL）
    await redis.set(`authcode:${normalizedEmail}`, code, { ex: 300 });
    await redis.set(`ratelimit:${normalizedEmail}`, Date.now().toString(), { ex: 60 });

    // メール送信
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: normalizedEmail,
      subject: 'タスク管理アプリ - ログインコード',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #333;">ログインコード</h2>
          <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">
            ${code}
          </p>
          <p style="color: #666; font-size: 14px;">
            このコードは5分間有効です。<br>
            心当たりがない場合は、このメールを無視してください。
          </p>
        </div>
      `
    });

    // 常に成功レスポンス（メール存在有無を隠す）
    return res.status(200).json({
      success: true,
      message: '認証コードを送信しました'
    });

  } catch (error) {
    console.error('Send code error:', error);
    return res.status(500).json({ error: '認証コードの送信に失敗しました' });
  }
}
