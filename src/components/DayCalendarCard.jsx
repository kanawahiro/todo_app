import React, { memo } from 'react';
import { getWeekday, formatMinutes, formatTimeHHMM } from '../utils/formatters.js';
import { getTagColor } from '../constants/tagColors.js';

export const DayCalendarCard = memo(function DayCalendarCard({
  dateString,
  sessions,
  tasks,
  isToday,
  currentHour,
  currentMinute
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const pixelsPerHour = 60;

  const totalSeconds = sessions.reduce((sum, session) => {
    const start = session.start;
    const end = session.end || Date.now();
    return sum + Math.floor((end - start) / 1000);
  }, 0);

  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = getWeekday(dateString);

  return (
    <div style={{
      background: isToday ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      padding: '16px',
      width: '280px',
      flexShrink: 0
    }}>
      <div style={{
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: isToday ? '#00d4ff' : '#e8e8e8'
          }}>
            {month}/{day}({weekday})
            {isToday && <span style={{
              marginLeft: '8px',
              fontSize: '0.75rem',
              background: '#00d4ff',
              color: '#1a1a2e',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>今日</span>}
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>
          合計: {formatMinutes(totalSeconds)}
        </div>
      </div>

      <div style={{
        position: 'relative',
        height: `${24 * pixelsPerHour}px`,
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {hours.map(hour => (
          <div
            key={hour}
            style={{
              position: 'absolute',
              top: `${hour * pixelsPerHour}px`,
              left: 0,
              right: 0,
              height: `${pixelsPerHour}px`,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              paddingLeft: '4px',
              paddingTop: '2px'
            }}
          >
            <span style={{
              fontSize: '0.65rem',
              color: '#666',
              width: '32px'
            }}>
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {isToday && (
          <div style={{
            position: 'absolute',
            top: `${(currentHour + currentMinute / 60) * pixelsPerHour}px`,
            left: '32px',
            right: '4px',
            height: '2px',
            background: '#ef4444',
            zIndex: 10
          }} />
        )}

        {sessions.map((session, idx) => {
          const task = tasks.find(t => t.id === session.taskId);
          if (!task) return null;

          const startDate = new Date(session.start);
          const endDate = session.end ? new Date(session.end) : new Date();

          const startHour = startDate.getHours() + startDate.getMinutes() / 60;
          const endHour = endDate.getHours() + endDate.getMinutes() / 60;

          const top = startHour * pixelsPerHour;
          const height = Math.max((endHour - startHour) * pixelsPerHour, 20);

          const durationSec = Math.floor((endDate - startDate) / 1000);
          const tagColor = getTagColor(task.tag);
          const isActive = !session.end;

          return (
            <div
              key={`${session.taskId}-${idx}`}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: '36px',
                right: '4px',
                height: `${height}px`,
                background: tagColor.bg,
                borderLeft: `3px solid ${tagColor.border}`,
                borderRadius: '4px',
                padding: '4px 6px',
                overflow: 'hidden',
                fontSize: '0.7rem',
                color: '#e8e8e8',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {task.name || '(無題)'}
              </div>
              {height > 35 && (
                <div style={{ color: '#aaa', fontSize: '0.65rem' }}>
                  {formatTimeHHMM(session.start)}-{session.end ? formatTimeHHMM(session.end) : ''}
                </div>
              )}
              {height > 50 && (
                <div style={{ color: '#aaa', fontSize: '0.65rem' }}>
                  ({formatMinutes(durationSec)})
                  {isActive && <span style={{ color: '#ef4444', marginLeft: '4px' }}>作業中</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
