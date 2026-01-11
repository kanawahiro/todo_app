// タグごとの色定義
export const tagColors = {
  '売上アップ': { bg: 'rgba(0, 212, 255, 0.3)', border: '#00d4ff' },
  '雑務': { bg: 'rgba(156, 163, 175, 0.3)', border: '#9ca3af' },
  '仕入れ': { bg: 'rgba(34, 197, 94, 0.3)', border: '#22c55e' },
  '広告': { bg: 'rgba(249, 115, 22, 0.3)', border: '#f97316' },
  '受注発送関連': { bg: 'rgba(168, 85, 247, 0.3)', border: '#a855f7' },
  'default': { bg: 'rgba(107, 114, 128, 0.3)', border: '#6b7280' }
};

// タグヘッダー用の背景色定義（Cream & Blueテーマ対応）
export const tagHeaderColors = {
  '売上アップ': { bg: '#dbeafe', text: '#1e40af' },
  '雑務': { bg: '#f3f4f6', text: '#4b5563' },
  '仕入れ': { bg: '#d1fae5', text: '#065f46' },
  '広告': { bg: '#fed7aa', text: '#9a3412' },
  '受注発送関連': { bg: '#e9d5ff', text: '#6b21a8' },
  'default': { bg: '#f3f4f6', text: '#6b7280' }
};

export const getTagHeaderColor = (tag) => {
  return tagHeaderColors[tag] || tagHeaderColors['default'];
};

export const getTagColor = (tag) => {
  return tagColors[tag] || tagColors['default'];
};

// ステータスごとの色定義
export const statusColors = {
  '未着手': '#6b7280',
  '作業中': '#2563eb',
  '中断中': '#eab308',
  '待ち': '#f97316',
  '完了': '#22c55e'
};

export const getStatusColor = (status) => {
  return statusColors[status] || '#6b7280';
};

// ステータスアイコン
export const statusIcons = {
  '未着手': '☐',
  '作業中': '🔴',
  '中断中': '🟡',
  '待ち': '🟠',
  '完了': '✅'
};

export const getStatusIcon = (status) => {
  return statusIcons[status] || '☐';
};
