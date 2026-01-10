// 時間フォーマット関数
export const formatTime = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const hours = Math.floor(s / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const seconds = (s % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const formatMinutes = (sec) => {
  const minutes = Math.floor(sec / 60);
  if (minutes < 60) {
    return `${minutes}分`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
};

export const formatDateShort = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatTimeHHMM = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 日付文字列を取得 (YYYY-MM-DD) - ローカルタイムゾーン基準
export const getDateString = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 曜日を取得
export const getWeekday = (dateString) => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

// HH:MM形式の文字列をその日のタイムスタンプに変換
export const timeStringToTimestamp = (timeStr, dateString) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateString);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

// タイムスタンプをHH:MM形式に変換
export const timestampToTimeString = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 時刻文字列のバリデーション
export const isValidTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

// 経過時間を計算（startAtベース）
export const calculateElapsedTime = (task) => {
  const accumulated = task.accumulatedTime || 0;
  if (task.startedAt && task.status === '作業中') {
    const now = Date.now();
    const elapsed = Math.floor((now - task.startedAt) / 1000);
    return accumulated + elapsed;
  }
  return accumulated;
};

// workSessionsからaccumulatedTimeを再計算
export const recalculateAccumulatedTime = (workSessions) => {
  let total = 0;
  workSessions.forEach(session => {
    if (session.end) {
      total += Math.floor((session.end - session.start) / 1000);
    }
  });
  return total;
};
