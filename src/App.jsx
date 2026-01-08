import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RegisterTab, TodayTab, CalendarTab, DatabaseTab, ReviewTab } from './components/AppTabs.jsx';
import { calculateElapsedTime, getDateString } from './utils/formatters.js';
import { styles } from './styles/styles.js';

function TaskManagerApp({ apiKey }) {
  const [tab, setTab] = useState('register');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tags, setTags] = useState(['売上アップ', '雑務', '仕入れ', '広告', '受注発送関連']);
  const [tagOrder, setTagOrder] = useState(['売上アップ', '雑務', '仕入れ', '広告', '受注発送関連']);
  const [newTag, setNewTag] = useState('');
  const [input, setInput] = useState('');
  const [extracted, setExtracted] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [toDelete, setToDelete] = useState(new Set());
  const [period, setPeriod] = useState('week');
  const [expanded, setExpanded] = useState(new Set());
  const [aiReview, setAiReview] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [fTag, setFTag] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [dFrom, setDFrom] = useState('');
  const [dTo, setDTo] = useState('');
  const [delDlg, setDelDlg] = useState({ show: false, id: null, name: '' });
  const [tagDlg, setTagDlg] = useState({ show: false, name: '', count: 0 });
  const [newTaskId, setNewTaskId] = useState(null);
  const taskInputRefs = useRef({});

  const [tick, setTick] = useState(0);
  const tickRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const hasActiveTask = useMemo(() => {
    return tasks.some(t => t.status === '作業中');
  }, [tasks]);

  useEffect(() => {
    async function loadData() {
      try {
        const tasksData = await window.storage.get('tasks');
        if (tasksData && tasksData.value) {
          const loadedTasks = JSON.parse(tasksData.value);
          const migratedTasks = loadedTasks.map(t => ({
            ...t,
            accumulatedTime: t.accumulatedTime ?? t.elapsedTime ?? 0,
            startedAt: t.startedAt ?? null,
            workSessions: t.workSessions ?? []
          }));
          setTasks(migratedTasks);
        }
      } catch (e) {
        console.error('タスク読み込みエラー:', e);
        setLoadError('タスクの読み込みに失敗しました');
      }

      try {
        const tagOrderData = await window.storage.get('tagOrder');
        if (tagOrderData && tagOrderData.value) {
          setTagOrder(JSON.parse(tagOrderData.value));
        }
      } catch (e) {
        console.error('タグ順序読み込みエラー:', e);
      }

      try {
        const tagsData = await window.storage.get('tags');
        if (tagsData && tagsData.value) {
          setTags(JSON.parse(tagsData.value));
        }
      } catch (e) {
        console.error('タグ読み込みエラー:', e);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      window.storage.set('tasks', JSON.stringify(tasks)).catch(e => {
        console.error('タスク保存エラー:', e);
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tasks, loading]);

  useEffect(() => {
    if (!loading) {
      window.storage.set('tagOrder', JSON.stringify(tagOrder)).catch(e => {
        console.error('タグ順序保存エラー:', e);
      });
    }
  }, [tagOrder, loading]);

  useEffect(() => {
    if (!loading) {
      window.storage.set('tags', JSON.stringify(tags)).catch(e => {
        console.error('タグ保存エラー:', e);
      });
    }
  }, [tags, loading]);

  useEffect(() => {
    if (hasActiveTask) {
      tickRef.current = setInterval(() => {
        setTick(t => t + 1);
      }, 1000);
    } else {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [hasActiveTask]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasActiveTask) {
        setTick(t => t + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasActiveTask]);

  const elapsedTimes = useMemo(() => {
    const times = {};
    tasks.forEach(task => {
      times[task.id] = calculateElapsedTime(task);
    });
    return times;
  }, [tasks, tick]);

  useEffect(() => {
    if (newTaskId) {
      const timeoutId = setTimeout(() => {
        const inputRef = taskInputRefs.current[newTaskId];
        if (inputRef) {
          inputRef.focus();
          inputRef.select();
        }
        setNewTaskId(null);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [newTaskId]);

  const extractTasks = async () => {
    if (!input.trim()) return;
    setExtracting(true);
    setExtractError(null);

    if (!apiKey) {
      const lines = input.split('\n').filter(l => l.trim());
      setExtracted(lines.map((l, i) => ({
        name: l.trim(),
        tag: tags[0] || '',
        memo: '',
        tid: Date.now() + i
      })));
      setExtracting(false);
      return;
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `タスク抽出。タグ:${tags.join(',')}。テキスト:${input}。JSON形式のみ:[{"name":"","tag":"","memo":""}]`
          }]
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const text = data.content[0].text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      setExtracted(parsed.map((t, i) => ({
        ...t,
        tid: Date.now() + i
      })));
    } catch (e) {
      console.error('タスク抽出エラー:', e);
      setExtractError('AI抽出に失敗しました。行ごとにタスクを作成します。');
      const lines = input.split('\n').filter(l => l.trim());
      setExtracted(lines.map((l, i) => ({
        name: l.trim(),
        tag: tags[0] || '',
        memo: '',
        tid: Date.now() + i
      })));
    }
    setExtracting(false);
  };

  const registerTasks = useCallback(() => {
    const newTasks = extracted
      .filter(t => !toDelete.has(t.tid))
      .map((t, index) => {
        const tagTasks = tasks.filter(x => x.tag === t.tag);
        const maxOrder = tagTasks.length > 0
          ? Math.max(...tagTasks.map(x => x.order || 0))
          : -1;
        const newId = Date.now() + Math.random() + index;
        return {
          id: newId,
          name: t.name,
          memo: t.memo,
          tag: t.tag,
          status: '未着手',
          statusComment: '',
          registeredDate: today,
          workDates: [],
          completedDate: null,
          accumulatedTime: 0,
          startedAt: null,
          workSessions: [],
          order: maxOrder + 1 + index
        };
      });

    setTasks(prev => [...prev, ...newTasks]);
    setExtracted([]);
    setInput('');
    setToDelete(new Set());
    setTab('today');
  }, [extracted, toDelete, tasks, today]);

  const startTask = useCallback((id) => {
    const now = Date.now();
    setTasks(prev => prev.map(t => {
      if (t.id !== id && t.status === '作業中') {
        const elapsed = t.startedAt ? Math.floor((now - t.startedAt) / 1000) : 0;
        const updatedSessions = t.workSessions.map((s, idx) =>
          idx === t.workSessions.length - 1 && !s.end
            ? { ...s, end: now }
            : s
        );
        return {
          ...t,
          status: '中断中',
          accumulatedTime: (t.accumulatedTime || 0) + elapsed,
          startedAt: null,
          workSessions: updatedSessions
        };
      }
      if (t.id === id) {
        return {
          ...t,
          status: '作業中',
          startedAt: now,
          workDates: t.workDates.includes(today) ? t.workDates : [...t.workDates, today],
          completedDate: null,
          workSessions: [...(t.workSessions || []), { start: now, end: null, taskId: id }]
        };
      }
      return t;
    }));
  }, [today]);

  const pauseTask = useCallback((id) => {
    const now = Date.now();
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const elapsed = t.startedAt ? Math.floor((now - t.startedAt) / 1000) : 0;
        const updatedSessions = (t.workSessions || []).map((s, idx) =>
          idx === (t.workSessions || []).length - 1 && !s.end
            ? { ...s, end: now }
            : s
        );
        return {
          ...t,
          status: '中断中',
          accumulatedTime: (t.accumulatedTime || 0) + elapsed,
          startedAt: null,
          workSessions: updatedSessions
        };
      }
      return t;
    }));
  }, []);

  const waitTask = useCallback((id) => {
    const now = Date.now();
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const elapsed = t.startedAt ? Math.floor((now - t.startedAt) / 1000) : 0;
        const updatedSessions = (t.workSessions || []).map((s, idx) =>
          idx === (t.workSessions || []).length - 1 && !s.end
            ? { ...s, end: now }
            : s
        );
        return {
          ...t,
          status: '待ち',
          accumulatedTime: (t.accumulatedTime || 0) + elapsed,
          startedAt: null,
          workSessions: updatedSessions
        };
      }
      return t;
    }));
  }, []);

  const completeTask = useCallback((id) => {
    const now = Date.now();
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const elapsed = t.startedAt ? Math.floor((now - t.startedAt) / 1000) : 0;
        const updatedSessions = (t.workSessions || []).map((s, idx) =>
          idx === (t.workSessions || []).length - 1 && !s.end
            ? { ...s, end: now }
            : s
        );
        return {
          ...t,
          status: '完了',
          accumulatedTime: (t.accumulatedTime || 0) + elapsed,
          startedAt: null,
          completedDate: today,
          workSessions: updatedSessions
        };
      }
      return t;
    }));
  }, [today]);

  const updateTask = useCallback((id, field, value) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setDelDlg({ show: false, id: null, name: '' });
  }, []);

  const handleDeleteClick = useCallback((id, name) => {
    setDelDlg({ show: true, id, name });
  }, []);

  const updateSessions = useCallback((taskId, newSessions, newAccumulatedTime) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          workSessions: newSessions,
          accumulatedTime: newAccumulatedTime
        };
      }
      return t;
    }));
  }, []);

  const addTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags(prev => [...prev, trimmed]);
    setTagOrder(prev => [...prev, trimmed]);
    setNewTag('');
  }, [newTag, tags]);

  const deleteTagStart = useCallback((name) => {
    const count = tasks.filter(t => t.tag === name).length;
    if (count > 0) {
      setTagDlg({ show: true, name, count });
    } else {
      setTags(prev => prev.filter(t => t !== name));
      setTagOrder(prev => prev.filter(t => t !== name));
    }
  }, [tasks]);

  const confirmDeleteTag = useCallback((name) => {
    setTasks(prev => prev.map(t =>
      t.tag === name ? { ...t, tag: '' } : t
    ));
    setTags(prev => prev.filter(t => t !== name));
    setTagOrder(prev => prev.filter(t => t !== name));
    setTagDlg({ show: false, name: '', count: 0 });
  }, []);

  const moveTag = useCallback((name, dir) => {
    setTagOrder(prev => {
      const idx = prev.indexOf(name);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }, []);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === '完了') {
        return t.completedDate === today;
      }
      return true;
    });
  }, [tasks, today]);

  const tasksByTag = useMemo(() => {
    const result = {};

    const sortTasks = (taskList) => {
      return [...taskList].sort((a, b) => {
        if (a.status === '完了' && b.status !== '完了') return 1;
        if (a.status !== '完了' && b.status === '完了') return -1;
        return (a.order || 0) - (b.order || 0);
      });
    };

    tagOrder.forEach(tag => {
      result[tag] = sortTasks(todayTasks.filter(t => t.tag === tag));
    });

    result[''] = sortTasks(todayTasks.filter(t => !t.tag || t.tag === ''));

    return result;
  }, [todayTasks, tagOrder]);

  const moveTaskInTag = useCallback((id, dir) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;

      if (task.status === '完了') return prev;

      const tagTaskList = tasksByTag[task.tag] || [];
      const nonCompletedTasks = tagTaskList.filter(t => t.status !== '完了');
      const idx = nonCompletedTasks.findIndex(t => t.id === id);
      const newIdx = idx + dir;

      if (newIdx < 0 || newIdx >= nonCompletedTasks.length) return prev;

      const targetTask = nonCompletedTasks[newIdx];
      const currentOrder = task.order || 0;
      const targetOrder = targetTask.order || 0;

      return prev.map(t => {
        if (t.id === id) return { ...t, order: targetOrder };
        if (t.id === targetTask.id) return { ...t, order: currentOrder };
        return t;
      });
    });
  }, [tasksByTag]);

  const addManualTask = useCallback((tag) => {
    const tagTasks = tasksByTag[tag] || [];
    const nonCompletedTasks = tagTasks.filter(t => t.status !== '完了');
    const minOrder = nonCompletedTasks.length > 0
      ? Math.min(...nonCompletedTasks.map(t => t.order || 0))
      : 0;

    const newId = Date.now() + Math.random();
    const newTask = {
      id: newId,
      name: '',
      memo: '',
      tag: tag,
      status: '未着手',
      statusComment: '',
      registeredDate: today,
      workDates: [],
      completedDate: null,
      accumulatedTime: 0,
      startedAt: null,
      workSessions: [],
      order: minOrder - 1
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskId(newId);
  }, [tasksByTag, today]);

  const calendarData = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const data = {};
    dates.forEach(dateStr => {
      data[dateStr] = [];
    });

    tasks.forEach(task => {
      (task.workSessions || []).forEach(session => {
        const sessionDate = getDateString(session.start);
        if (data[sessionDate]) {
          data[sessionDate].push({
            ...session,
            taskId: task.id
          });
        }
      });
    });

    Object.keys(data).forEach(dateStr => {
      data[dateStr].sort((a, b) => a.start - b.start);
    });

    return { dates, data };
  }, [tasks, tick]);

  const reviewTasks = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === 'week') {
      start.setDate(start.getDate() - 7);
    } else {
      start.setMonth(start.getMonth() - 1);
    }
    return tasks.filter(t => {
      const d = new Date(t.registeredDate);
      return d >= start && d <= now;
    });
  }, [tasks, period]);

  const generateReview = async () => {
    setReviewing(true);
    setReviewError(null);

    const completedCount = reviewTasks.filter(t => t.status === '完了').length;
    const totalCount = reviewTasks.length;

    if (!apiKey) {
      setAiReview('APIキーが設定されていないため、AI分析を実行できません。');
      setReviewing(false);
      return;
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `タスク振り返り。期間:${period === 'week' ? '1週間' : '1ヶ月'}。総数:${totalCount}件、完了:${completedCount}件。形式:\n【よかった点】\n・\n【改善点】\n・\n【次への提案】\n・`
          }]
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setAiReview(data.content[0].text);
    } catch (e) {
      console.error('レビュー生成エラー:', e);
      setReviewError('AI分析の生成に失敗しました');
      setAiReview('');
    }
    setReviewing(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (fTag !== 'all') {
        if (fTag === 'none' && t.tag) return false;
        if (fTag !== 'none' && t.tag !== fTag) return false;
      }
      if (fStatus !== 'all' && t.status !== fStatus) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (dFrom && new Date(t.registeredDate) < new Date(dFrom)) return false;
      if (dTo) {
        const to = new Date(dTo);
        to.setHours(23, 59, 59);
        if (new Date(t.registeredDate) > to) return false;
      }
      return true;
    });
  }, [tasks, fTag, fStatus, search, dFrom, dTo]);

  if (loading) {
    return (
      <div style={{
        ...styles.container,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        読み込み中...
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{
        ...styles.container,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={styles.error}>{loadError}</div>
        <button
          style={styles.btn}
          onClick={() => window.location.reload()}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {delDlg.show && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h3 style={{ margin: '0 0 16px', color: '#fff' }}>削除しますか?</h3>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>
              「{delDlg.name || '無題のタスク'}」を削除します。
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDelDlg({ show: false, id: null, name: '' })}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #666',
                  background: 'transparent',
                  color: '#ccc',
                  cursor: 'pointer'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => deleteTask(delDlg.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {tagDlg.show && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h3 style={{ margin: '0 0 16px', color: '#fff' }}>タグを削除?</h3>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>
              「{tagDlg.name}」には{tagDlg.count}件のタスクがあります。
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setTagDlg({ show: false, name: '', count: 0 })}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #666',
                  background: 'transparent',
                  color: '#ccc',
                  cursor: 'pointer'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => confirmDeleteTag(tagDlg.name)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>📋 タスク管理</h1>
        <p style={{ margin: '8px 0 0', color: '#888', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </header>

      <nav style={styles.tabNav}>
        {[
          { id: 'register', label: '📝 登録' },
          { id: 'today', label: '⏱️ 今日' },
          { id: 'calendar', label: '📅 カレンダー' },
          { id: 'database', label: '📊 DB' },
          { id: 'review', label: '📈 振り返り' }
        ].map(x => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            style={{
              ...styles.tabBtn,
              ...(tab === x.id ? styles.tabBtnActive : {})
            }}
          >
            {x.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {tab === 'register' && (
          <RegisterTab
            input={input}
            setInput={setInput}
            extracting={extracting}
            extractTasks={extractTasks}
            extractError={extractError}
            extracted={extracted}
            toDelete={toDelete}
            setToDelete={setToDelete}
            setExtracted={setExtracted}
            registerTasks={registerTasks}
            tags={tags}
            newTag={newTag}
            setNewTag={setNewTag}
            addTag={addTag}
            deleteTagStart={deleteTagStart}
          />
        )}

        {tab === 'today' && (
          <TodayTab
            tagOrder={tagOrder}
            tasksByTag={tasksByTag}
            elapsedTimes={elapsedTimes}
            moveTag={moveTag}
            addManualTask={addManualTask}
            updateTask={updateTask}
            moveTaskInTag={moveTaskInTag}
            startTask={startTask}
            pauseTask={pauseTask}
            completeTask={completeTask}
            waitTask={waitTask}
            handleDeleteClick={handleDeleteClick}
            updateSessions={updateSessions}
            newTaskId={newTaskId}
            taskInputRefs={taskInputRefs}
          />
        )}

        {tab === 'calendar' && (
          <CalendarTab
            calendarData={calendarData}
            tasks={tasks}
            currentHour={currentHour}
            currentMinute={currentMinute}
          />
        )}

        {tab === 'database' && (
          <DatabaseTab
            search={search}
            setSearch={setSearch}
            fTag={fTag}
            setFTag={setFTag}
            fStatus={fStatus}
            setFStatus={setFStatus}
            dFrom={dFrom}
            setDFrom={setDFrom}
            dTo={dTo}
            setDTo={setDTo}
            tags={tags}
            filteredTasks={filteredTasks}
            elapsedTimes={elapsedTimes}
            handleDeleteClick={handleDeleteClick}
          />
        )}

        {tab === 'review' && (
          <ReviewTab
            period={period}
            setPeriod={setPeriod}
            reviewTasks={reviewTasks}
            elapsedTimes={elapsedTimes}
            tags={tags}
            expanded={expanded}
            setExpanded={setExpanded}
            reviewing={reviewing}
            generateReview={generateReview}
            reviewError={reviewError}
            aiReview={aiReview}
          />
        )}
      </main>
    </div>
  );
}

export default TaskManagerApp;
