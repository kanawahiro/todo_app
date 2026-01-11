import React, { useState } from 'react';
import { styles } from '../styles/styles.js';

export function RoutineTaskManager({
  routineTasks,
  onAddToToday,
  onAddMultipleToToday,
  onEdit,
  onDelete,
  onAdd
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const today = new Date().getDay(); // 0=日, 1=月, ..., 6=土
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const todayName = dayNames[today];

  const isTodayTask = (task) => {
    return task.days.includes(todayName);
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAddMultiple = () => {
    if (selectedIds.size === 0) return;
    onAddMultipleToToday(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleAddAllToday = () => {
    if (todayTasks.length === 0) return;
    const todayTaskIds = todayTasks.map(t => t.id);
    onAddMultipleToToday(todayTaskIds);
  };

  // 今日のタスクと、それ以外に分類
  const todayTasks = routineTasks.filter(isTodayTask);
  const otherTasks = routineTasks.filter(t => !isTodayTask(t));

  return (
    <div style={styles.routineSection}>
      <div style={styles.routineHeader}>
        <h3>📅 ルーティンタスク</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {todayTasks.length > 0 && (
            <button
              onClick={handleAddAllToday}
              style={{
                ...styles.btn,
                background: '#10b981',
                marginTop: 0,
                fontSize: '0.85rem'
              }}
            >
              ✨ 今日の予定をすべて追加
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={handleAddMultiple}
              style={{
                ...styles.btn,
                background: '#22c55e',
                marginTop: 0,
                fontSize: '0.85rem'
              }}
            >
              ✓ 選択したタスクを今日に追加 ({selectedIds.size}件)
            </button>
          )}
        </div>
      </div>

      {/* 今日のタスク */}
      {todayTasks.length > 0 && (
        <>
          <h4 style={{ color: '#22c55e', marginTop: '16px', marginBottom: '8px' }}>
            ✨今日のタスク ({todayName}曜日)
          </h4>
          {todayTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isToday={true}
              isSelected={selectedIds.has(task.id)}
              onToggleSelect={() => toggleSelect(task.id)}
              onAddToToday={() => onAddToToday(task.id)}
              onEdit={() => onEdit(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </>
      )}

      {/* その他のタスク */}
      {otherTasks.length > 0 && (
        <>
          {todayTasks.length > 0 && (
            <h4 style={{ color: '#888', marginTop: '16px', marginBottom: '8px' }}>
              その他
            </h4>
          )}
          {otherTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isToday={false}
              isSelected={selectedIds.has(task.id)}
              onToggleSelect={() => toggleSelect(task.id)}
              onAddToToday={() => onAddToToday(task.id)}
              onEdit={() => onEdit(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </>
      )}

      <button onClick={onAdd} style={{ ...styles.btn, marginTop: '12px' }}>
        + 新規ルーティンタスク
      </button>
    </div>
  );
}

// タスクカードコンポーネント
function TaskCard({
  task,
  isToday,
  isSelected,
  onToggleSelect,
  onAddToToday,
  onEdit,
  onDelete
}) {
  return (
    <div
      style={{
        ...styles.routineCard,
        background: isToday
          ? 'rgba(34, 197, 94, 0.1)' // 今日の曜日: 緑背景
          : 'rgba(255,255,255,0.05)',  // その他: 通常背景
        border: isSelected
          ? '2px solid #22c55e'
          : '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* チェックボックス */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          style={{ marginTop: '4px' }}
        />

        <div style={{ flex: 1 }}>
          <div style={styles.routineTaskHeader}>
            <h4 style={{ margin: 0 }}>
              {isToday && '🟢 '}
              {task.name}
            </h4>
            <button
              onClick={onAddToToday}
              style={{
                ...styles.actionBtn,
                marginBottom: 0,
                background: '#00d4ff'
              }}
            >
              個別に追加
            </button>
          </div>

          {task.memo && (
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0' }}>
              メモ: {task.memo}
            </p>
          )}

          <div style={styles.routineInfo}>
            {task.tag && (
              <div style={{ marginBottom: '4px' }}>
                🏷️ タグ: <span style={{
                  padding: '2px 8px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>{task.tag}</span>
              </div>
            )}
            <span>⏱️ 見積: {task.estimatedMinutes}分</span>
            <div style={{ marginTop: '4px' }}>
              📅 曜日: {task.days.map(day => (
                <span key={day} style={styles.dayChip}>{day}</span>
              ))}
            </div>
          </div>

          <div style={styles.routineActions}>
            <button onClick={onEdit} style={styles.actionBtn}>編集</button>
            <button onClick={onDelete} style={styles.deleteBtn}>削除</button>
          </div>
        </div>
      </div>
    </div>
  );
}
