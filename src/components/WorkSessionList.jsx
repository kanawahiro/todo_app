import React, { useState, useCallback, memo } from 'react';
import { WorkSessionItem } from './WorkSessionItem.jsx';
import { AddSessionForm } from './AddSessionForm.jsx';
import { recalculateAccumulatedTime, getDateString } from '../utils/formatters.js';
import { styles } from '../styles/styles.js';

export const WorkSessionList = memo(function WorkSessionList({
  task,
  onUpdateSessions
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const sessions = task.workSessions || [];
  const dateString = task.registeredDate;

  const todaySessions = sessions.filter(s => {
    const sessionDate = getDateString(s.start);
    return sessionDate === dateString;
  }).sort((a, b) => a.start - b.start);

  const handleUpdateSession = useCallback((index, updatedSession) => {
    const originalIndex = sessions.findIndex(s =>
      s.start === todaySessions[index].start &&
      s.end === todaySessions[index].end
    );
    if (originalIndex === -1) return;

    const newSessions = [...sessions];
    newSessions[originalIndex] = { ...updatedSession, taskId: task.id };

    const newAccumulatedTime = recalculateAccumulatedTime(newSessions);
    onUpdateSessions(task.id, newSessions, newAccumulatedTime);
  }, [sessions, todaySessions, task.id, onUpdateSessions]);

  const handleDeleteSession = useCallback((index) => {
    const originalIndex = sessions.findIndex(s =>
      s.start === todaySessions[index].start &&
      s.end === todaySessions[index].end
    );
    if (originalIndex === -1) return;

    const newSessions = sessions.filter((_, i) => i !== originalIndex);
    const newAccumulatedTime = recalculateAccumulatedTime(newSessions);
    onUpdateSessions(task.id, newSessions, newAccumulatedTime);
  }, [sessions, todaySessions, task.id, onUpdateSessions]);

  const handleAddSession = useCallback((newSession) => {
    const newSessions = [...sessions, { ...newSession, taskId: task.id }];
    newSessions.sort((a, b) => a.start - b.start);

    const newAccumulatedTime = recalculateAccumulatedTime(newSessions);
    onUpdateSessions(task.id, newSessions, newAccumulatedTime);
    setShowAddForm(false);
  }, [sessions, task.id, onUpdateSessions]);

  if (todaySessions.length === 0 && !showAddForm) {
    return (
      <div style={{ marginTop: '10px' }}>
        <div
          onClick={() => setShowAddForm(true)}
          style={{
            color: '#666',
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            border: '1px dashed rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}
        >
          + 作業履歴を追加
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '6px 0',
          color: '#888',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ marginRight: '6px' }}>{isExpanded ? '▼' : '▶'}</span>
        <span>作業履歴 ({todaySessions.length}件)</span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '8px' }}>
          {todaySessions.map((session, index) => {
            const isActive = !session.end && task.status === '作業中';
            return (
              <WorkSessionItem
                key={`${session.start}-${index}`}
                session={session}
                index={index}
                isActive={isActive}
                dateString={dateString}
                onUpdateSession={handleUpdateSession}
                onDeleteSession={handleDeleteSession}
              />
            );
          })}

          {showAddForm ? (
            <AddSessionForm
              dateString={dateString}
              onAdd={handleAddSession}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              style={styles.addSessionBtn}
            >
              + セッションを追加
            </button>
          )}
        </div>
      )}
    </div>
  );
});
