import React, { useState, memo } from 'react';
import { isValidTimeString, timeStringToTimestamp } from '../utils/formatters.js';
import { styles } from '../styles/styles.js';

export const AddSessionForm = memo(function AddSessionForm({
  dateString,
  onAdd,
  onCancel
}) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');

    if (!isValidTimeString(startTime)) {
      setError('開始時刻の形式が不正です');
      return;
    }

    if (!isValidTimeString(endTime)) {
      setError('終了時刻の形式が不正です');
      return;
    }

    const startTs = timeStringToTimestamp(startTime, dateString);
    const endTs = timeStringToTimestamp(endTime, dateString);
    const now = Date.now();

    if (startTs >= endTs) {
      setError('開始は終了より前にしてください');
      return;
    }

    if (endTs > now) {
      setError('未来の時刻は設定できません');
      return;
    }

    onAdd({ start: startTs, end: endTs });
  };

  return (
    <div style={{
      ...styles.sessionItem,
      border: '1px dashed rgba(0,212,255,0.5)',
      background: 'rgba(0,212,255,0.05)'
    }}>
      <div style={{ fontSize: '0.8rem', color: '#00d4ff', marginBottom: '8px' }}>
        新規セッション
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: '#888', fontSize: '0.8rem' }}>開始</span>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{
            ...styles.timeInput,
            ...(error ? styles.timeInputError : {})
          }}
        />
        <span style={{ color: '#666' }}>〜</span>
        <span style={{ color: '#888', fontSize: '0.8rem' }}>終了</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{
            ...styles.timeInput,
            ...(error ? styles.timeInputError : {})
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#00d4ff',
            color: '#1a1a2e',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}
        >
          追加
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #666',
            background: 'transparent',
            color: '#888',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          キャンセル
        </button>
      </div>
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );
});
