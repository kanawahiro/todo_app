import React, { useState, useEffect } from 'react';
import { styles } from '../styles/styles.js';

export function RoutineTaskForm({
  initialTask = null,
  onSave,
  onCancel,
  tags = []
}) {
  const [name, setName] = useState(initialTask?.name || '');
  const [memo, setMemo] = useState(initialTask?.memo || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialTask?.estimatedMinutes || 0
  );
  const [tag, setTag] = useState(initialTask?.tag || '');
  const [days, setDays] = useState(initialTask?.days || []);
  const [isEveryDay, setIsEveryDay] = useState(false);

  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

  // 初期値が全曜日選択の場合、「毎日」チェックをONに
  useEffect(() => {
    if (initialTask?.days?.length === 7) {
      setIsEveryDay(true);
    }
  }, [initialTask]);

  // 「毎日」チェックボックスの処理
  useEffect(() => {
    if (isEveryDay) {
      setDays([...dayNames]);
    }
  }, [isEveryDay]);

  const toggleDay = (day) => {
    setDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
    setIsEveryDay(false); // 個別選択時は「毎日」を解除
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('タスク名を入力してください');
      return;
    }
    onSave({
      name: name.trim(),
      memo: memo.trim(),
      estimatedMinutes: Number(estimatedMinutes) || 0,
      tag: tag,
      days
    });
  };

  return (
    <div style={styles.formOverlay}>
      <div style={styles.formModal}>
        <h3>{initialTask ? 'ルーティンタスクを編集' : 'ルーティンタスクを追加'}</h3>

        <label style={{ display: 'block', marginTop: '16px', marginBottom: '4px' }}>
          タスク名 *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 相場分析"
          style={styles.input}
        />

        <label style={{ display: 'block', marginTop: '16px', marginBottom: '4px' }}>
          メモ
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例: 朝イチで市場動向をチェック"
          style={styles.input}
        />

        <label style={{ display: 'block', marginTop: '16px', marginBottom: '4px' }}>
          見積もり時間（分）
        </label>
        <input
          type="number"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
          min="0"
          step="5"
          style={styles.input}
        />

        <label style={{ display: 'block', marginTop: '16px', marginBottom: '4px' }}>
          タグ
        </label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={styles.input}
        >
          <option value="">タグなし</option>
          {tags.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label style={{ display: 'block', marginTop: '16px', marginBottom: '8px' }}>
          実行曜日
        </label>
        <div style={styles.daySelector}>
          {dayNames.map(day => (
            <label key={day} style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
                style={{ marginRight: '4px' }}
              />
              {day}
            </label>
          ))}
        </div>

        <label style={{ display: 'block', marginTop: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isEveryDay}
            onChange={(e) => setIsEveryDay(e.target.checked)}
            style={{ marginRight: '4px' }}
          />
          毎日（全曜日を自動選択）
        </label>

        <div style={styles.formActions}>
          <button onClick={onCancel} style={{ ...styles.btn, background: '#666' }}>
            キャンセル
          </button>
          <button onClick={handleSave} style={styles.btn}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
