import React, { memo } from 'react';
import { WorkSessionList } from './WorkSessionList.jsx';
import { getStatusIcon, getStatusColor } from '../constants/tagColors.js';
import { formatDateShort, formatTime } from '../utils/formatters.js';
import { styles } from '../styles/styles.js';

export const TaskCard = memo(function TaskCard({
  task,
  index,
  listLength,
  elapsedTime,
  onUpdateTask,
  onMoveTask,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onWaitTask,
  onDeleteClick,
  onUpdateSessions,
  inputRef
}) {
  const statusColor = getStatusColor(task.status);
  const isWorking = task.status === '作業中';

  return (
    <div style={{
      ...styles.card,
      borderLeftColor: statusColor,
      background: isWorking ? '#eff6ff' : '#ffffff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span>{getStatusIcon(task.status)}</span>
        <input
          type="text"
          value={task.name}
          onChange={(e) => onUpdateTask(task.id, 'name', e.target.value)}
          ref={inputRef}
          placeholder="タスク名を入力..."
          style={{ ...styles.input, flex: 1, padding: '6px 10px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            onClick={() => onMoveTask(task.id, -1)}
            disabled={index === 0}
            style={{
              padding: '2px 6px',
              fontSize: '0.7rem',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              color: '#6b6b6b',
              borderRadius: '4px',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              opacity: index === 0 ? 0.5 : 1
            }}
          >↑</button>
          <button
            onClick={() => onMoveTask(task.id, 1)}
            disabled={index === listLength - 1}
            style={{
              padding: '2px 6px',
              fontSize: '0.7rem',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              color: '#6b6b6b',
              borderRadius: '4px',
              cursor: index === listLength - 1 ? 'not-allowed' : 'pointer',
              opacity: index === listLength - 1 ? 0.5 : 1
            }}
          >↓</button>
        </div>
      </div>
      <input
        type="text"
        value={task.memo || ''}
        onChange={(e) => onUpdateTask(task.id, 'memo', e.target.value)}
        placeholder="📝 メモ"
        style={{ ...styles.input, marginBottom: '8px', padding: '6px 10px', fontSize: '0.85rem' }}
      />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '0.85rem'
      }}>
        <label style={{ color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⏱️ 見積:
        </label>
        <input
          type="number"
          value={task.estimatedMinutes || ''}
          onChange={(e) => onUpdateTask(task.id, 'estimatedMinutes', Number(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="5"
          style={{
            ...styles.input,
            width: '60px',
            padding: '4px 8px',
            textAlign: 'right'
          }}
        />
        <span style={{ color: '#6b6b6b' }}>分</span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#6b6b6b', marginBottom: '8px' }}>
        📅 登録: {formatDateShort(task.registeredDate)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
        <span style={{ color: statusColor }}>{task.status}</span>
        <span style={{ color: '#6b6b6b' }}>⏱️ {formatTime(elapsedTime)}</span>
      </div>
      <input
        type="text"
        value={task.statusComment || ''}
        onChange={(e) => onUpdateTask(task.id, 'statusComment', e.target.value)}
        placeholder="コメント..."
        style={{ ...styles.input, marginBottom: '10px', padding: '6px 10px', fontSize: '0.8rem' }}
      />

      <WorkSessionList
        task={task}
        onUpdateSessions={onUpdateSessions}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
        {task.status === '未着手' && (
          <button style={styles.actionBtn} onClick={() => onStartTask(task.id)}>▶ 開始</button>
        )}
        {task.status === '作業中' && (
          <>
            <button style={styles.actionBtn} onClick={() => onPauseTask(task.id)}>⏸ 中断</button>
            <button style={styles.actionBtn} onClick={() => onCompleteTask(task.id)}>✓ 完了</button>
            <button style={styles.actionBtn} onClick={() => onWaitTask(task.id)}>⏳ 待ち</button>
          </>
        )}
        {(task.status === '中断中' || task.status === '待ち') && (
          <>
            <button style={styles.actionBtn} onClick={() => onStartTask(task.id)}>▶ 再開</button>
            <button style={styles.actionBtn} onClick={() => onCompleteTask(task.id)}>✓ 完了</button>
          </>
        )}
        {task.status === '完了' && (
          <button style={styles.actionBtn} onClick={() => onStartTask(task.id)}>▶ 再開</button>
        )}
        <button
          style={styles.deleteBtn}
          onClick={() => onDeleteClick(task.id, task.name)}
        >
          🗑
        </button>
      </div>
    </div>
  );
});
