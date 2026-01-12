# ルーティンタスク機能追加 - 実装計画書

## 📋 概要

定期的に行うタスクを「ルーティンタスク」として登録し、曜日指定で管理できる機能を追加します。

---

## 🎯 要件サマリー

### 主要機能
1. **ルーティンタスク管理**: 定期的なタスクをテンプレートとして保存
2. **曜日指定**: 月〜日 + 「毎日」の8パターンに対応
3. **今日のタスクに追加**: ワンクリックでルーティンタスクを通常タスクとしてコピー
4. **複数選択一括追加**: チェックボックスで複数タスクを選択し、まとめて今日のタスクに追加 ★NEW★
5. **見積もり時間**: 通常タスク・ルーティンタスク両方に見積もり時間（分）を追加

### UI配置
```
[登録タブ]
  ┌─────────────────────────────────┐
  │ タスクを入力                      │
  │ [テキストエリア]                  │
  │ [タスクを抽出]                    │
  ├─────────────────────────────────┤
  │ 📅 ルーティンタスク ★NEW★         │ ← タグ管理の上に配置
  │ [選択したタスクを今日に追加]      │
  │ [ルーティンタスク一覧]            │
  │ [+ 新規ルーティンタスク]          │
  ├─────────────────────────────────┤
  │ 🏷️ タグ管理                      │
  │ [タグ一覧]                        │
  └─────────────────────────────────┘
```

---

## 📊 データ構造

### 1. ルーティンタスク（新規追加）

```javascript
{
  id: number,              // ユニークID (Date.now() + Math.random())
  name: string,            // タスク名（必須）
  memo: string,            // メモ（任意）
  estimatedMinutes: number, // 見積もり時間（分単位、デフォルト0）
  days: string[],          // ['月','火','水','木','金','土','日']
  order: number            // 表示順序
}
```

**例:**
```javascript
{
  id: 1736668800123.456,
  name: "相場分析",
  memo: "朝イチで市場動向をチェック",
  estimatedMinutes: 30,
  days: ['月', '火', '水', '木', '金'],
  order: 0
}
```

### 2. 通常タスク（既存に追加）

既存のタスク構造に `estimatedMinutes` プロパティを追加:

```javascript
{
  id: number,
  name: string,
  memo: string,
  tag: string,
  status: string,
  statusComment: string,
  registeredDate: string,
  workDates: string[],
  completedDate: string | null,
  accumulatedTime: number,
  startedAt: number | null,
  workSessions: array,
  order: number,
  estimatedMinutes: number  // ★NEW★ 見積もり時間（分単位）
}
```

---

## 🎨 UI設計

### ルーティンタスク管理セクション（複数選択対応）

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 ルーティンタスク                                          │
│ [✓ 選択したタスクを今日に追加 (3件)]  ← 選択数に応じて表示  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] 相場分析                            [個別に追加]     │ │
│ │     メモ: 朝イチで市場動向をチェック                     │ │
│ │     見積: 30分                                           │ │
│ │     曜日: [✓月] [✓火] [✓水] [✓木] [✓金] [ 土] [ 日]    │ │
│ │                                     [編集] [削除]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [ ] メール配信                          [個別に追加]     │ │
│ │     メモ: 週次レポートを配信                             │ │
│ │     見積: 60分                                           │ │
│ │     曜日: [ 月] [ 火] [✓水] [ 木] [ 金] [ 土] [ 日]    │ │
│ │                                     [編集] [削除]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] 日報作成                            [個別に追加]     │ │
│ │     メモ: 業務終了時に作成                               │ │
│ │     見積: 15分                                           │ │
│ │     曜日: [✓毎日]                                        │ │
│ │                                     [編集] [削除]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ 新規ルーティンタスク]                                     │
└─────────────────────────────────────────────────────────────┘
```

### 新規/編集フォーム

```
┌─────────────────────────────────────────────┐
│ ルーティンタスクを追加                       │
├─────────────────────────────────────────────┤
│ タスク名 *                                   │
│ [________________________]                  │
│                                              │
│ メモ                                         │
│ [________________________]                  │
│                                              │
│ 見積もり時間（分）                           │
│ [____] 分                                    │
│                                              │
│ 実行曜日                                     │
│ [□ 月] [□ 火] [□ 水] [□ 木]                │
│ [□ 金] [□ 土] [□ 日]                        │
│                                              │
│ [✓ 毎日] ← ONで全曜日自動選択               │
│                                              │
│ [キャンセル]  [保存]                         │
└─────────────────────────────────────────────┘
```

### 今日の曜日をハイライト表示

```
今日が水曜日の場合:

┌─────────────────────────────────────────────────────────────┐
│ 📅 ルーティンタスク                                          │
│ [✓ 選択したタスクを今日に追加 (2件)]                         │
├─────────────────────────────────────────────────────────────┤
│ ✨今日のタスク (水曜日)                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] 🟢 相場分析                         [個別に追加]    │ │ ← 今日の曜日
│ │     メモ: 朝イチで市場動向をチェック                     │ │    (緑背景)
│ │     見積: 30分                                           │ │
│ │     曜日: [✓月] [✓火] [✓水] [✓木] [✓金] [ 土] [ 日]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] 🟢 日報作成                         [個別に追加]    │ │ ← 今日の曜日
│ │     メモ: 業務終了時に作成                               │ │    (緑背景)
│ │     見積: 15分                                           │ │
│ │     曜日: [✓毎日]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ その他                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [ ] メール配信                          [個別に追加]    │ │ ← 今日の曜日外
│ │     メモ: 週次レポートを配信                             │ │    (通常背景)
│ │     見積: 60分                                           │ │
│ │     曜日: [ 月] [ 火] [ 水] [✓木] [ 金] [ 土] [ 日]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 実装の詳細

### 変更・追加ファイル一覧

| ファイル | 変更内容 | 優先度 |
|---------|---------|-------|
| `src/App.jsx` | ルーティンタスクステート管理、CRUD関数、データマイグレーション | 🔴 高 |
| `src/components/AppTabs.jsx` | `RegisterTab`にルーティンタスクセクション追加 | 🔴 高 |
| `src/components/RoutineTaskManager.jsx` | ルーティンタスク管理コンポーネント（新規作成） | 🔴 高 |
| `src/components/RoutineTaskForm.jsx` | ルーティンタスク追加/編集フォーム（新規作成） | 🟡 中 |
| `src/components/TagColumn.jsx` | タスク表示に見積もり時間を追加 | 🟡 中 |
| `src/storage.js` | 変更なし（既存の仕組みを利用） | - |

---

## 🛠️ 実装ステップ

### フェーズ1: データ層（App.jsx）

#### 1-1. ステート追加
```javascript
const [routineTasks, setRoutineTasks] = useState([]); // ルーティンタスク一覧
```

#### 1-2. LocalStorage読み込み・保存
```javascript
// 初回マウント時
useEffect(() => {
  const loadData = async () => {
    const savedRoutineTasks = await window.storage.get('routineTasks');
    if (savedRoutineTasks) {
      setRoutineTasks(JSON.parse(savedRoutineTasks));
    }
  };
  loadData();
}, []);

// routineTasks変更時の保存
useEffect(() => {
  if (routineTasks.length > 0) {
    window.storage.set('routineTasks', JSON.stringify(routineTasks));
  }
}, [routineTasks]);
```

#### 1-3. データマイグレーション
```javascript
// 既存タスクに estimatedMinutes を追加（デフォルト0）
useEffect(() => {
  const migrateData = async () => {
    const savedTasks = await window.storage.get('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      const migratedTasks = parsedTasks.map(task => ({
        ...task,
        estimatedMinutes: task.estimatedMinutes ?? 0
      }));
      setTasks(migratedTasks);
      await window.storage.set('tasks', JSON.stringify(migratedTasks));
    }
  };
  migrateData();
}, []);
```

#### 1-4. CRUD関数
```javascript
// ルーティンタスク追加
const addRoutineTask = useCallback((task) => {
  const newTask = {
    id: Date.now() + Math.random(),
    name: task.name,
    memo: task.memo || '',
    estimatedMinutes: task.estimatedMinutes || 0,
    days: task.days || [],
    order: routineTasks.length
  };
  setRoutineTasks(prev => [...prev, newTask]);
}, [routineTasks]);

// ルーティンタスク更新
const updateRoutineTask = useCallback((id, updates) => {
  setRoutineTasks(prev =>
    prev.map(t => t.id === id ? { ...t, ...updates } : t)
  );
}, []);

// ルーティンタスク削除
const deleteRoutineTask = useCallback((id) => {
  if (window.confirm('このルーティンタスクを削除しますか？')) {
    setRoutineTasks(prev => prev.filter(t => t.id !== id));
  }
}, []);

// ルーティンタスクから通常タスクへコピー（単一）
const addRoutineTaskToToday = useCallback((routineTaskId) => {
  const routineTask = routineTasks.find(t => t.id === routineTaskId);
  if (!routineTask) return;

  const today = new Date().toISOString().split('T')[0];
  const newTask = {
    id: Date.now() + Math.random(),
    name: routineTask.name,
    memo: routineTask.memo,
    tag: '', // デフォルトはタグなし（後で選択可能に）
    status: '未着手',
    statusComment: '',
    registeredDate: today,
    workDates: [],
    completedDate: null,
    accumulatedTime: 0,
    startedAt: null,
    workSessions: [],
    estimatedMinutes: routineTask.estimatedMinutes,
    order: 0 // タグ内の最上位に追加
  };

  setTasks(prev => [...prev, newTask]);
  setTab('today'); // 今日タブに遷移
}, [routineTasks, tasks]);

// ★NEW★ 複数のルーティンタスクを一括で今日のタスクに追加
const addMultipleRoutineTasksToToday = useCallback((routineTaskIds) => {
  if (routineTaskIds.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  const newTasks = routineTaskIds.map((id, index) => {
    const routineTask = routineTasks.find(t => t.id === id);
    if (!routineTask) return null;

    return {
      id: Date.now() + Math.random() + index,
      name: routineTask.name,
      memo: routineTask.memo,
      tag: '',
      status: '未着手',
      statusComment: '',
      registeredDate: today,
      workDates: [],
      completedDate: null,
      accumulatedTime: 0,
      startedAt: null,
      workSessions: [],
      estimatedMinutes: routineTask.estimatedMinutes,
      order: index // 選択順で並ぶ
    };
  }).filter(Boolean); // nullを除外

  setTasks(prev => [...prev, ...newTasks]);
  setTab('today'); // 今日タブに遷移
}, [routineTasks, tasks]);
```

---

### フェーズ2: UI層（コンポーネント）

#### 2-1. RoutineTaskManager.jsx（新規作成）
```javascript
import React, { useState } from 'react';
import { styles } from '../styles/styles.js';

// 責務: ルーティンタスク一覧の表示・管理
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
    setSelectedIds(new Set()); // 追加後に選択をクリア
  };

  // 今日のタスクと、それ以外に分類
  const todayTasks = routineTasks.filter(isTodayTask);
  const otherTasks = routineTasks.filter(t => !isTodayTask(t));

  return (
    <div style={styles.routineSection}>
      <div style={styles.routineHeader}>
        <h3>📅 ルーティンタスク</h3>
        {selectedIds.size > 0 && (
          <button
            onClick={handleAddMultiple}
            style={{
              ...styles.btn,
              background: '#22c55e',
              marginTop: 0
            }}
          >
            ✓ 選択したタスクを今日に追加 ({selectedIds.size}件)
          </button>
        )}
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
```

#### 2-2. RoutineTaskForm.jsx（新規作成）
```javascript
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/styles.js';

// 責務: ルーティンタスクの追加・編集フォーム
export function RoutineTaskForm({
  initialTask = null,
  onSave,
  onCancel
}) {
  const [name, setName] = useState(initialTask?.name || '');
  const [memo, setMemo] = useState(initialTask?.memo || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialTask?.estimatedMinutes || 0
  );
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
```

#### 2-3. AppTabs.jsx - RegisterTab更新
```javascript
import { RoutineTaskManager } from './RoutineTaskManager.jsx';
import { RoutineTaskForm } from './RoutineTaskForm.jsx';

export function RegisterTab({
  // ...既存のprops
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

      {/* 既存のAI抽出UI */}
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

      {/* 抽出結果表示（既存） */}
      {/* ... */}

      {/* ★NEW★ ルーティンタスクセクション */}
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

      {/* タグ管理（既存）*/}
      <div style={{
        marginTop: '40px',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px'
      }}>
        <h3 style={{ marginBottom: '12px' }}>🏷️ タグ管理</h3>
        {/* ... */}
      </div>
    </div>
  );
}
```

---

### フェーズ3: 見積もり時間表示の追加

#### 3-1. TagColumn.jsx - タスク表示に見積もり時間を追加
```javascript
// タスク表示部分に見積もり時間を追加
<div style={styles.taskCard}>
  <div>{task.name}</div>
  <div>{task.memo}</div>

  {/* ★NEW★ 見積もり時間表示 */}
  {task.estimatedMinutes > 0 && (
    <div style={styles.estimatedTime}>
      ⏱️ 見積: {task.estimatedMinutes}分
    </div>
  )}

  {/* 実績時間表示（既存）*/}
  <div>{formatTime(elapsedTimes[task.id])}</div>
</div>
```

#### 3-2. タスク追加・編集フォームに見積もり時間入力欄を追加
```javascript
// TagColumn.jsxの手動タスク追加フォーム
<input
  type="number"
  placeholder="見積時間（分）"
  value={newTaskEstimatedMinutes}
  onChange={(e) => setNewTaskEstimatedMinutes(e.target.value)}
  min="0"
  step="5"
/>
```

---

## 📁 LocalStorage構成

| キー | 値 | 備考 |
|------|---|------|
| `tasks` | タスク配列（JSON） | `estimatedMinutes`プロパティ追加 |
| `routineTasks` | ルーティンタスク配列（JSON） | ★NEW★ |
| `tags` | タグ配列（JSON） | 既存 |
| `tagOrder` | タグ順序配列（JSON） | 既存 |

---

## ✅ 検証・テスト項目

### 基本動作
- [ ] ルーティンタスクの追加・編集・削除ができる
- [ ] 曜日チェックボックスの選択/解除が動作する
- [ ] 「毎日」チェックで全曜日が選択される
- [ ] 「毎日」解除で個別選択に戻る
- [ ] 「個別に追加」で通常タスクとしてコピーされる
- [ ] コピー時にタスク名・メモ・見積もり時間が引き継がれる

### 複数選択機能 ★NEW★
- [ ] チェックボックスでタスクを複数選択できる
- [ ] 選択数が正しく表示される
- [ ] 「選択したタスクを今日に追加」で全タスクがコピーされる
- [ ] 追加後に選択状態がクリアされる
- [ ] 0件選択時はボタンが表示されない

### 表示
- [ ] 今日の曜日のルーティンタスクがハイライトされる
- [ ] 見積もり時間が正しく表示される
- [ ] タスク一覧でorder順に並ぶ
- [ ] 今日のタスクと、その他のタスクが分類表示される

### データ永続化
- [ ] ページリロード後もルーティンタスクが保持される
- [ ] 既存タスクにestimatedMinutesが自動追加される（マイグレーション）

### エッジケース
- [ ] タスク名が空欄の場合は登録できない
- [ ] 曜日が1つも選択されていない場合の動作
- [ ] 見積もり時間が0または空欄の場合の動作

---

## 🎨 スタイル定義（参考）

```javascript
// styles.jsに追加
export const styles = {
  // ...既存スタイル

  routineSection: {
    marginTop: '40px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px'
  },

  routineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },

  routineCard: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px'
  },

  routineTaskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },

  routineInfo: {
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '8px'
  },

  dayChip: {
    display: 'inline-block',
    padding: '2px 8px',
    margin: '2px',
    background: 'rgba(0,212,255,0.2)',
    borderRadius: '4px',
    fontSize: '0.75rem'
  },

  routineActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },

  formOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  formModal: {
    background: '#1a1a1a',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },

  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    justifyContent: 'flex-end'
  },

  daySelector: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },

  estimatedTime: {
    fontSize: '0.8rem',
    color: '#888',
    marginTop: '4px'
  }
};
```

---

## 🚀 実装優先順位

### Phase 1: 最小機能（MVP）
1. データ構造の追加（App.jsx）
2. ルーティンタスク追加・一覧表示
3. 「個別に追加」機能
4. LocalStorage保存

### Phase 2: 複数選択機能 ★NEW★
1. チェックボックスUI実装
2. 選択状態の管理（Set使用）
3. 「選択したタスクを今日に追加」ボタン
4. 一括追加関数の実装

### Phase 3: UI改善
1. 曜日選択UI
2. 「毎日」チェックボックス
3. 今日の曜日ハイライト
4. 編集・削除機能
5. 今日のタスク/その他の分類表示

### Phase 4: 見積もり時間対応
1. estimatedMinutesプロパティ追加
2. データマイグレーション
3. 入力フォーム追加
4. 表示UI追加

---

## 📝 補足事項

### 複数選択の動作仕様
- チェックボックスの選択状態は `Set` で管理（重複なし、高速検索）
- 「選択したタスクを今日に追加」ボタンは1件以上選択時のみ表示
- 追加後は自動的に選択状態をクリア
- 個別追加ボタンとの併用可能

### 「今日に追加」時のタグ指定
現時点では「タグなし」で追加されますが、将来的には以下の拡張が可能:
- ルーティンタスクにデフォルトタグを設定
- 追加時にタグ選択ダイアログを表示

### 並び替え機能
現在の仕様では `order` プロパティで順序管理していますが、ドラッグ&ドロップまたは上下ボタンでの並び替え機能は今回のスコープ外とします（将来的に追加可能）。

### 見積もり時間と実績時間の比較
現在は表示のみですが、将来的には以下の分析機能を追加可能:
- 見積vs実績の乖離率表示
- タスク完了時に「見積より早かった/遅かった」のフィードバック
- 振り返りタブで見積精度の分析

---

## 🔄 データマイグレーション戦略

```javascript
// App.jsx初回マウント時
const migrateTaskData = (tasks) => {
  return tasks.map(task => {
    // estimatedMinutesが存在しない場合はデフォルト0を設定
    if (task.estimatedMinutes === undefined) {
      return { ...task, estimatedMinutes: 0 };
    }
    return task;
  });
};

useEffect(() => {
  const loadData = async () => {
    const savedTasks = await window.storage.get('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      const migratedTasks = migrateTaskData(parsedTasks);
      setTasks(migratedTasks);

      // マイグレーション済みデータを保存
      await window.storage.set('tasks', JSON.stringify(migratedTasks));
    }
  };
  loadData();
}, []);
```

---

## 📸 完成イメージ（モックアップ）

### ルーティンタスク管理画面（複数選択機能付き）
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 ルーティンタスク                                          │
│ [✓ 選択したタスクを今日に追加 (2件)]                         │
├─────────────────────────────────────────────────────────────┤
│ ✨今日のタスク (水曜日)                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] 🟢 相場分析                         [個別に追加]    │ │
│ │     メモ: 朝イチで市場動向をチェック                     │ │
│ │     ⏱️ 見積: 30分                                       │ │
│ │     📅 月 火 水 木 金                                     │ │
│ │                                     [編集] [削除]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] 🟢 日報作成                         [個別に追加]    │ │
│ │     メモ: 業務終了時に作成                               │ │
│ │     ⏱️ 見積: 15分                                       │ │
│ │     📅 毎日                                               │ │
│ │                                     [編集] [削除]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ その他                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [ ] メール配信                          [個別に追加]    │ │
│ │     メモ: 週次レポートを配信                             │ │
│ │     ⏱️ 見積: 60分                                       │ │
│ │     📅 木                                                 │ │
│ │                                     [編集] [削除]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [+ 新規ルーティンタスク]                                     │
└─────────────────────────────────────────────────────────────┘
```

---

以上がルーティンタスク機能の実装計画書です。
