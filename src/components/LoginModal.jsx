import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const loginStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fbf9f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif'
  },
  container: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d2c2c',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '#6b6b6b',
    fontSize: '0.9rem',
    marginBottom: '24px',
    textAlign: 'center'
  },
  label: {
    display: 'block',
    color: '#2d2c2c',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '8px'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#2d2c2c',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '16px'
  },
  codeInput: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#2d2c2c',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: '16px',
    textAlign: 'center',
    letterSpacing: '8px'
  },
  btn: {
    padding: '14px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
    transition: 'background 0.2s'
  },
  btnDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed'
  },
  error: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginBottom: '16px',
    padding: '10px 12px',
    background: '#fef2f2',
    borderRadius: '6px',
    border: '1px solid #fecaca'
  },
  success: {
    color: '#16a34a',
    fontSize: '0.85rem',
    marginBottom: '16px',
    padding: '10px 12px',
    background: '#f0fdf4',
    borderRadius: '6px',
    border: '1px solid #bbf7d0'
  },
  link: {
    color: '#2563eb',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'underline',
    marginTop: '16px',
    display: 'block',
    textAlign: 'center'
  },
  backBtn: {
    color: '#6b6b6b',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};

export function LoginModal({ onSuccess }) {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // メールアドレス送信
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendCode(email);
      setSuccess('認証コードを送信しました');
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 認証コード検証
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyCode(email, code);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // コード再送信
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendCode(email);
      setSuccess('認証コードを再送信しました');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // メール入力画面に戻る
  const handleBack = () => {
    setStep('email');
    setCode('');
    setError('');
    setSuccess('');
  };

  return (
    <div style={loginStyles.overlay}>
      <div style={loginStyles.container}>
        {step === 'email' ? (
          <>
            <h1 style={loginStyles.title}>ログイン</h1>
            <p style={loginStyles.subtitle}>
              メールアドレスに認証コードを送信します
            </p>

            {error && <div style={loginStyles.error}>{error}</div>}

            <form onSubmit={handleSendCode}>
              <label style={loginStyles.label}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={loginStyles.input}
                required
                disabled={loading}
              />

              <button
                type="submit"
                style={{
                  ...loginStyles.btn,
                  ...(loading ? loginStyles.btnDisabled : {})
                }}
                disabled={loading}
              >
                {loading ? '送信中...' : '認証コードを送信'}
              </button>
            </form>
          </>
        ) : (
          <>
            <button style={loginStyles.backBtn} onClick={handleBack}>
              ← 戻る
            </button>

            <h1 style={loginStyles.title}>認証コード入力</h1>
            <p style={loginStyles.subtitle}>
              {email} に送信された6桁のコードを入力してください
            </p>

            {error && <div style={loginStyles.error}>{error}</div>}
            {success && <div style={loginStyles.success}>{success}</div>}

            <form onSubmit={handleVerifyCode}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                style={loginStyles.codeInput}
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />

              <button
                type="submit"
                style={{
                  ...loginStyles.btn,
                  ...(loading || code.length !== 6 ? loginStyles.btnDisabled : {})
                }}
                disabled={loading || code.length !== 6}
              >
                {loading ? '確認中...' : 'ログイン'}
              </button>
            </form>

            <button
              style={loginStyles.link}
              onClick={handleResend}
              disabled={loading}
            >
              コードを再送信
            </button>
          </>
        )}
      </div>
    </div>
  );
}
