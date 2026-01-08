import React, { useState, useEffect, memo } from 'react';
import {
  timestampToTimeString,
  timeStringToTimestamp,
  isValidTimeString,
  formatMinutes
} from '../utils/formatters.js';
import { styles } from '../styles/styles.js';

export const WorkSessionItem = memo(function WorkSessionItem({
  session,
  index,
  isActive,
  dateString,
  onUpdateSession,
  onDeleteSession
}) {
  const [startTime, setStartTime] = useState(timestampToTimeString(session.start));
  const [endTime, setEndTime] = useState(session.end ? timestampToTimeString(session.end) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    setStartTime(timestampToTimeString(session.start));
    setEndTime(session.end ? timestampToTimeString(session.end) : '');
  }, [session.start, session.end]);

  const handleStartChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndChange = (e) => {
    setEndTime(e.target.value);
  };

  const validateAndUpdate = (newStart, newEnd) => {
    setError('');

    if (!isValidTimeString(newStart)) {
      setError('開始時刻の形式が不正です');
      return false;
    }

    if (!isActive && newEnd) {
      if (!isValidTimeString(newEnd)) {
        setError('終了時刻の形式が不正です');
        return false;
      }

      const startTs = timeStringToTimestamp(newStart, dateString);
      const endTs = timeStringToTimestamp(newEnd, dateString);

      if (startTs >= endTs) {
        setError('開始は終了より前にしてください');
        return false;
      }

      const now = Date.now();
      if (endTs > now) {
        setError('未来の時刻は設定できません');
        return false;
      }
    }

    const startTs = timeStringToTimestamp(newStart, dateString);
    const now = Date.now();
    if (startTs > now) {
      setError('未来の時刻は設定できません');
      return false;
    }

    return true;
  };

  const handleStartBlur = () => {
    if (validateAndUpdate(startTime, endTime)) {
      const newStart = timeStringToTimestamp(startTime, dateString);
      if (newStart !== session.start) {
        onUpdateSession(index, { ...session, start: newStart });
      }
    } else {
      setStartTime(timestampToTimeString(session.start));
    }
  };

  const handleEndBlur = () => {
    if (isActive) return;

    if (validateAndUpdate(startTime, endTime)) {
      const newEnd = endTime ? timeStringToTimestamp(endTime, dateString) : null;
      if (newEnd !== session.end) {
        onUpdateSession(index, { ...session, end: newEnd });
      }
    } else {
      setEndTime(session.end ? timestampToTimeString(session.end) : '');
    }
  };

  const durationSec = isActive
    ? Math.floor((Date.now() - session.start) / 1000)
    : session.end
      ? Math.floor((session.end - session.start) / 1000)
      : 0;

  return (
    <div style={styles.sessionItem}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: '#888', fontSize: '0.8rem', minWidth: '20px' }}>{index + 1}.</span>
        <input
          type="time"
          value={startTime}
          onChange={handleStartChange}
          onBlur={handleStartBlur}
          style={{
            ...styles.timeInput,
            ...(error ? styles.timeInputError : {})
          }}
        />
        <span style={{ color: '#666' }}>〜</span>
        {isActive ? (
          <span style={{
            color: '#666',
            fontSize: '0.9rem',
            padding: '6px 8px',
            minWidth: '90px',
            textAlign: 'center'
          }}>--:--</span>
        ) : (
          <input
            type="time"
            value={endTime}
            onChange={handleEndChange}
            onBlur={handleEndBlur}
            style={{
              ...styles.timeInput,
              ...(error ? styles.timeInputError : {})
            }}
          />
        )}
        <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '4px' }}>
          ({formatMinutes(durationSec)})
        </span>
        {isActive && (
          <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>🔴作業中</span>
        )}
        <button
          onClick={() => onDeleteSession(index)}
          style={{ ...styles.sessionDeleteBtn, marginLeft: 'auto' }}
        >
          🗑
        </button>
      </div>
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', marginLeft: '28px' }}>
          {error}
        </div>
      )}
    </div>
  );
});
