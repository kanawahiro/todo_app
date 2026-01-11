import React, { memo } from 'react';
import { TaskCard } from './TaskCard.jsx';
import { styles } from '../styles/styles.js';
import { getTagHeaderColor } from '../constants/tagColors.js';

export const TagColumn = memo(function TagColumn({
  tag,
  tagIndex,
  tagOrderLength,
  tasks,
  elapsedTimes,
  onMoveTag,
  onAddTask,
  onUpdateTask,
  onMoveTask,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onWaitTask,
  onDeleteClick,
  onUpdateSessions,
  newTaskId,
  taskInputRefs
}) {
  const isNoTag = tag === '';
  const headerColor = getTagHeaderColor(tag);

  return (
    <div style={styles.column}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px',
        background: headerColor.bg,
        borderRadius: '8px',
        gap: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {!isNoTag && (
          <button
            onClick={() => onMoveTag(tag, -1)}
            disabled={tagIndex === 0}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.1)',
              color: headerColor.text,
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: tagIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: tagIndex === 0 ? 0.5 : 1
            }}
          >←</button>
        )}
        <h3 style={{ margin: 0, color: headerColor.text, fontSize: '1rem', flex: 1, textAlign: 'center', fontWeight: '600' }}>
          {tag || 'タグなし'}
        </h3>
        <button
          onClick={() => onAddTask(tag)}
          style={{
            background: '#2563eb',
            border: 'none',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >+</button>
        {!isNoTag && (
          <button
            onClick={() => onMoveTag(tag, 1)}
            disabled={tagIndex === tagOrderLength - 1}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,0,0,0.1)',
              color: headerColor.text,
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: tagIndex === tagOrderLength - 1 ? 'not-allowed' : 'pointer',
              opacity: tagIndex === tagOrderLength - 1 ? 0.5 : 1
            }}
          >→</button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p style={{ color: '#6b6b6b', textAlign: 'center' }}>タスクなし</p>
      ) : (
        tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            index={i}
            listLength={tasks.length}
            elapsedTime={elapsedTimes[task.id] || 0}
            onUpdateTask={onUpdateTask}
            onMoveTask={onMoveTask}
            onStartTask={onStartTask}
            onPauseTask={onPauseTask}
            onCompleteTask={onCompleteTask}
            onWaitTask={onWaitTask}
            onDeleteClick={onDeleteClick}
            onUpdateSessions={onUpdateSessions}
            inputRef={task.id === newTaskId ? (el) => { taskInputRefs.current[task.id] = el; } : null}
          />
        ))
      )}
    </div>
  );
});
