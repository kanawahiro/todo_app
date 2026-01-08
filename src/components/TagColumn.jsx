import React, { memo } from 'react';
import { TaskCard } from './TaskCard.jsx';
import { styles } from '../styles/styles.js';

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

  return (
    <div style={styles.column}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        gap: '8px'
      }}>
        {!isNoTag && (
          <button
            onClick={() => onMoveTag(tag, -1)}
            disabled={tagIndex === 0}
            style={{
              background: 'transparent',
              border: '1px solid #444',
              color: '#888',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: tagIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: tagIndex === 0 ? 0.5 : 1
            }}
          >←</button>
        )}
        <h3 style={{ margin: 0, color: '#00d4ff', fontSize: '1rem', flex: 1, textAlign: 'center' }}>
          {tag || 'タグなし'}
        </h3>
        <button
          onClick={() => onAddTask(tag)}
          style={{
            background: 'linear-gradient(90deg, #00d4ff, #7b2cbf)',
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
              border: '1px solid #444',
              color: '#888',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: tagIndex === tagOrderLength - 1 ? 'not-allowed' : 'pointer',
              opacity: tagIndex === tagOrderLength - 1 ? 0.5 : 1
            }}
          >→</button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>タスクなし</p>
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
