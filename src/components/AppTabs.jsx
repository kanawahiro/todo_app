import React, { useState } from 'react';
import { TagColumn } from './TagColumn.jsx';
import { DayCalendarCard } from './DayCalendarCard.jsx';
import { RoutineTaskManager } from './RoutineTaskManager.jsx';
import { RoutineTaskForm } from './RoutineTaskForm.jsx';
import { getStatusColor, getStatusIcon } from '../constants/tagColors.js';
import { formatDateShort, formatTime } from '../utils/formatters.js';
import { styles } from '../styles/styles.js';

// 登録タブ
export function RegisterTab({
  input,
  setInput,
  extracting,
  extractTasks,
  extractError,
  extracted,
  toDelete,
  setToDelete,
  setExtracted,
  registerTasks,
  tags,
  newTag,
  setNewTag,
  addTag,
  deleteTagStart,
  aiStatus,
  routineTasks,
  onAddRoutineTask,
  onUpdateRoutineTask,
  onDeleteRoutineTask,
  onAddRoutineTaskToToday,
  onAddMultipleRoutineTasksToToday
}) {
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>タスクを入力</h2>
      <textarea
        style={styles.textarea}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="今日やることを入力..."
      />
      <button
        style={{
          ...styles.btn,
          opacity: extracting || !input.trim() ? 0.5 : 1,
          cursor: extracting || !input.trim() ? 'not-allowed' : 'pointer'
        }}
        onClick={extractTasks}
        disabled={extracting || !input.trim()}
      >
        {extracting ? '抽出中...' : 'タスクを抽出'}
      </button>

      {extractError && (
        <div style={{ ...styles.error, marginTop: '12px' }}>{extractError}</div>
      )}

      {extracted.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>抽出タスク:</h3>
            {aiStatus === 'ok' && (
              <span style={{
                background: '#22c55e',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                AI処理OK
              </span>
            )}
            {aiStatus === 'ng' && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                AI NG
              </span>
            )}
          </div>
          {extracted.map(task => (
            <div
              key={task.tid}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={toDelete.has(task.tid)}
                  onChange={(e) => {
                    const s = new Set(toDelete);
                    e.target.checked ? s.add(task.tid) : s.delete(task.tid);
                    setToDelete(s);
                  }}
                />
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => setExtracted(prev =>
                    prev.map(t => t.tid === task.tid ? { ...t, name: e.target.value } : t)
                  )}
                  style={{ ...styles.input, flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '26px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={task.memo}
                  onChange={(e) => setExtracted(prev =>
                    prev.map(t => t.tid === task.tid ? { ...t, memo: e.target.value } : t)
                  )}
                  placeholder="メモ"
                  style={{ ...styles.input, flex: 1, minWidth: '150px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#888' }}>見積:</label>
                  <input
                    type="number"
                    value={task.estimatedMinutes || ''}
                    onChange={(e) => setExtracted(prev =>
                      prev.map(t => t.tid === task.tid
                        ? { ...t, estimatedMinutes: Number(e.target.value) || 0 }
                        : t)
                    )}
                    placeholder="0"
                    min="0"
                    step="5"
                    style={{
                      ...styles.input,
                      width: '60px',
                      textAlign: 'right'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>分</span>
                </div>
                <select
                  value={task.tag}
                  onChange={(e) => setExtracted(prev =>
                    prev.map(t => t.tid === task.tid ? { ...t, tag: e.target.value } : t)
                  )}
                  style={{ ...styles.input, width: 'auto', minWidth: '100px' }}
                >
                  <option value="">タグなし</option>
                  {tags.map(tg => (
                    <option key={tg} value={tg}>{tg}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button style={styles.btn} onClick={registerTasks}>登録する</button>
            {toDelete.size > 0 && (
              <button
                style={{ ...styles.btn, background: '#ef4444' }}
                onClick={() => {
                  setExtracted(prev => prev.filter(t => !toDelete.has(t.tid)));
                  setToDelete(new Set());
                }}
              >
                ☑を削除
              </button>
            )}
          </div>
        </div>
      )}

      <RoutineTaskManager
        routineTasks={routineTasks}
        onAddToToday={onAddRoutineTaskToToday}
        onAddMultipleToToday={onAddMultipleRoutineTasksToToday}
        onEdit={(id) => {
          setEditingRoutine(routineTasks.find(t => t.id === id));
          setShowRoutineForm(true);
        }}
        onDelete={onDeleteRoutineTask}
        onAdd={() => {
          setEditingRoutine(null);
          setShowRoutineForm(true);
        }}
      />

      {showRoutineForm && (
        <RoutineTaskForm
          initialTask={editingRoutine}
          tags={tags}
          onSave={(task) => {
            if (editingRoutine) {
              onUpdateRoutineTask(editingRoutine.id, task);
            } else {
              onAddRoutineTask(task);
            }
            setShowRoutineForm(false);
            setEditingRoutine(null);
          }}
          onCancel={() => {
            setShowRoutineForm(false);
            setEditingRoutine(null);
          }}
        />
      )}

      <div style={{
        marginTop: '40px',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px'
      }}>
        <h3 style={{ marginBottom: '12px' }}>🏷️ タグ管理</h3>
        <div style={{ marginBottom: '12px' }}>
          {tags.map(tg => (
            <span key={tg} style={styles.chip}>
              {tg}
              <button
                onClick={() => deleteTagStart(tg)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff6b6b',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="新規タグ"
            style={{ ...styles.input, flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <button onClick={addTag} style={{ ...styles.btn, marginTop: 0 }}>追加</button>
        </div>
      </div>
    </div>
  );
}

// 今日タブ
export function TodayTab({
  tagOrder,
  tasksByTag,
  elapsedTimes,
  moveTag,
  addManualTask,
  updateTask,
  moveTaskInTag,
  startTask,
  pauseTask,
  completeTask,
  waitTask,
  handleDeleteClick,
  updateSessions,
  newTaskId,
  taskInputRefs
}) {
  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>今日のタスク</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {tagOrder.map((tg, ti) => (
          <TagColumn
            key={tg}
            tag={tg}
            tagIndex={ti}
            tagOrderLength={tagOrder.length}
            tasks={tasksByTag[tg] || []}
            elapsedTimes={elapsedTimes}
            onMoveTag={moveTag}
            onAddTask={addManualTask}
            onUpdateTask={updateTask}
            onMoveTask={moveTaskInTag}
            onStartTask={startTask}
            onPauseTask={pauseTask}
            onCompleteTask={completeTask}
            onWaitTask={waitTask}
            onDeleteClick={handleDeleteClick}
            onUpdateSessions={updateSessions}
            newTaskId={newTaskId}
            taskInputRefs={taskInputRefs}
          />
        ))}

        {(tasksByTag[''] && tasksByTag[''].length > 0) && (
          <TagColumn
            key="no-tag"
            tag=""
            tagIndex={-1}
            tagOrderLength={0}
            tasks={tasksByTag[''] || []}
            elapsedTimes={elapsedTimes}
            onMoveTag={moveTag}
            onAddTask={addManualTask}
            onUpdateTask={updateTask}
            onMoveTask={moveTaskInTag}
            onStartTask={startTask}
            onPauseTask={pauseTask}
            onCompleteTask={completeTask}
            onWaitTask={waitTask}
            onDeleteClick={handleDeleteClick}
            onUpdateSessions={updateSessions}
            newTaskId={newTaskId}
            taskInputRefs={taskInputRefs}
          />
        )}
      </div>
    </div>
  );
}

// カレンダータブ
export function CalendarTab({ calendarData, tasks, currentHour, currentMinute }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>📅 カレンダー</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'flex-start'
      }}>
        {calendarData.dates.map((dateStr, idx) => (
          <DayCalendarCard
            key={dateStr}
            dateString={dateStr}
            sessions={calendarData.data[dateStr]}
            tasks={tasks}
            isToday={idx === 0}
            currentHour={currentHour}
            currentMinute={currentMinute}
          />
        ))}
      </div>
    </div>
  );
}

// DBタブ
export function DatabaseTab({
  search,
  setSearch,
  fTag,
  setFTag,
  fStatus,
  setFStatus,
  dFrom,
  setDFrom,
  dTo,
  setDTo,
  tags,
  filteredTasks,
  elapsedTimes,
  handleDeleteClick
}) {
  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>全タスク</h2>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...styles.input, width: '150px' }}
        />
        <select
          value={fTag}
          onChange={(e) => setFTag(e.target.value)}
          style={{ ...styles.input, width: 'auto' }}
        >
          <option value="all">全タグ</option>
          <option value="none">タグなし</option>
          {tags.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
          style={{ ...styles.input, width: 'auto' }}
        >
          <option value="all">全状態</option>
          {['未着手', '作業中', '中断中', '待ち', '完了'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
        <span style={{ color: '#888' }}>📅</span>
        <input
          type="date"
          value={dFrom}
          onChange={(e) => setDFrom(e.target.value)}
          style={{ ...styles.input, width: 'auto' }}
        />
        <span style={{ color: '#888' }}>〜</span>
        <input
          type="date"
          value={dTo}
          onChange={(e) => setDTo(e.target.value)}
          style={{ ...styles.input, width: 'auto' }}
        />
        <button
          onClick={() => { setDFrom(''); setDTo(''); }}
          style={{ ...styles.actionBtn, marginBottom: 0 }}
        >
          クリア
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              {['登録日', 'タスク', 'タグ', '状態', '時間', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '10px',
                    textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: '#888'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTasks
              .sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate))
              .map(task => (
                <tr key={task.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {task.registeredDate}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {task.name || '(無題)'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(0,212,255,0.15)',
                      color: '#00d4ff',
                      fontSize: '0.75rem'
                    }}>
                      {task.tag || 'なし'}
                    </span>
                  </td>
                  <td style={{
                    padding: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: getStatusColor(task.status)
                  }}>
                    {getStatusIcon(task.status)} {task.status}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {formatTime(elapsedTimes[task.id] || 0)}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteClick(task.id, task.name)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>該当なし</p>
        )}
      </div>
    </div>
  );
}

// 振り返りタブ
export function ReviewTab({
  period,
  setPeriod,
  reviewTasks,
  elapsedTimes,
  tags,
  expanded,
  setExpanded,
  reviewing,
  generateReview,
  reviewError,
  aiReview
}) {
  const comp = reviewTasks.filter(t => t.status === '完了').length;
  const total = reviewTasks.length;
  const rate = total > 0 ? Math.round(comp / total * 100) : 0;

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>振り返り</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setPeriod('week')}
          style={{ ...styles.tabBtn, ...(period === 'week' ? styles.tabBtnActive : {}) }}
        >
          今週
        </button>
        <button
          onClick={() => setPeriod('month')}
          style={{ ...styles.tabBtn, ...(period === 'month' ? styles.tabBtnActive : {}) }}
        >
          今月
        </button>
      </div>

      <div>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00d4ff' }}>
            {comp} / {total}
          </div>
          <div style={{ color: '#888', marginTop: '8px' }}>完了タスク</div>
          <div style={{ color: '#22c55e', marginTop: '4px' }}>完了率 {rate}%</div>
        </div>

        <h3 style={{ marginBottom: '12px' }}>タグ別実績</h3>
        {[...tags, 'タグなし'].map(tg => {
          const list = reviewTasks.filter(t =>
            tg === 'タグなし' ? (!t.tag || t.tag === '') : t.tag === tg
          );
          const tc = list.filter(t => t.status === '完了').length;
          const tt = list.reduce((s, t) => s + (elapsedTimes[t.id] || 0), 0);
          const isExp = expanded.has(tg);

          return (
            <div
              key={tg}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                marginBottom: '8px',
                overflow: 'hidden'
              }}
            >
              <div
                onClick={() => {
                  const s = new Set(expanded);
                  isExp ? s.delete(tg) : s.add(tg);
                  setExpanded(s);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ marginRight: '8px' }}>{isExp ? '▼' : '▶'}</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{tg}</span>
                <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.85rem' }}>
                  {list.length}件（{tc}完了, {formatTime(tt)}）
                </span>
              </div>
              {isExp && (
                <div style={{ padding: '0 12px 12px', background: 'rgba(0,0,0,0.2)' }}>
                  {list.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center' }}>タスクなし</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                      <tbody>
                        {list.map(t => (
                          <tr key={t.id}>
                            <td style={{ padding: '6px' }}>{t.name || '(無題)'}</td>
                            <td style={{ padding: '6px', color: getStatusColor(t.status) }}>
                              {t.status}
                            </td>
                            <td style={{ padding: '6px' }}>{formatTime(elapsedTimes[t.id] || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        style={{
          ...styles.btn,
          opacity: reviewing ? 0.5 : 1,
          cursor: reviewing ? 'not-allowed' : 'pointer'
        }}
        onClick={generateReview}
        disabled={reviewing}
      >
        {reviewing ? '分析中...' : 'AIに振り返りを依頼'}
      </button>

      {reviewError && (
        <div style={{ ...styles.error, marginTop: '12px' }}>{reviewError}</div>
      )}

      {aiReview && (
        <div style={{
          marginTop: '20px',
          background: 'rgba(123,44,191,0.1)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <h3 style={{ marginBottom: '12px' }}>🤖 AIフィードバック</h3>
          <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{aiReview}</div>
        </div>
      )}
    </div>
  );
}
