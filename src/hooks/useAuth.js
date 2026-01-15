import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [sessionToken, setSessionToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初期化時にlocalStorageからトークン読み込み
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      setSessionToken(token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // 認証コード送信
  const sendCode = useCallback(async (email) => {
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '認証コードの送信に失敗しました');
    }

    return data;
  }, []);

  // 認証コード検証 + ログイン
  const verifyCode = useCallback(async (email, code) => {
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '認証に失敗しました');
    }

    // セッショントークンを保存
    localStorage.setItem('sessionToken', data.sessionToken);
    setSessionToken(data.sessionToken);
    setIsAuthenticated(true);

    return data;
  }, []);

  // ログアウト（ローカルのみ）
  const logout = useCallback(() => {
    localStorage.removeItem('sessionToken');
    setSessionToken(null);
    setIsAuthenticated(false);
  }, []);

  return {
    sessionToken,
    isLoading,
    isAuthenticated,
    sendCode,
    verifyCode,
    logout
  };
}
