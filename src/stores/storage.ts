import type { SaveData, Mood, MissionMode, HistoryEntry } from '../types';

const STORAGE_KEY = 'calm60_save_v1';

// 초기 데이터
const getInitialData = (): SaveData => ({
  version: 1,
  lastCompletedDate: null,
  todayCount: 0,
  streak: 0,
  history: [],
  moodStats: {
    anxiety: 0,
    anger: 0,
    lethargy: 0,
    focus: 0,
    tension: 0,
    down: 0,
  },
  modeStats: {
    slow_tap: 0,
    hold_release: 0,
    grounding_321: 0,
  },
});

// 오늘 날짜 (YYYY-MM-DD)
export const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// 어제 날짜 (YYYY-MM-DD)
const getYesterdayDate = (): string => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split('T')[0];
};

// 데이터 로드
export const loadData = (): SaveData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getInitialData();

    const data = JSON.parse(saved) as SaveData;

    // 오늘 날짜 확인하여 todayCount 리셋
    const today = getTodayDate();
    if (data.lastCompletedDate !== today) {
      data.todayCount = 0;
    }

    return data;
  } catch {
    return getInitialData();
  }
};

// 데이터 저장
export const saveData = (data: SaveData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

// 완료 기록 저장
export const recordCompletion = (mood: Mood, mode: MissionMode): SaveData => {
  const data = loadData();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // todayCount 업데이트
  if (data.lastCompletedDate === today) {
    data.todayCount += 1;
  } else {
    data.todayCount = 1;
  }

  // streak 업데이트
  if (data.lastCompletedDate === yesterday) {
    data.streak += 1;
  } else if (data.lastCompletedDate !== today) {
    data.streak = 1;
  }
  // 같은 날이면 streak 유지

  // lastCompletedDate 업데이트
  data.lastCompletedDate = today;

  // history 업데이트
  const todayEntry = data.history.find(h => h.date === today);
  if (todayEntry) {
    todayEntry.count += 1;
  } else {
    data.history.push({ date: today, count: 1 });
  }

  // 최근 7일로 trim
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
  data.history = data.history.filter(h => h.date >= cutoffDate);

  // moodStats 업데이트
  data.moodStats[mood] += 1;

  // modeStats 업데이트
  data.modeStats[mode] += 1;

  // 저장
  saveData(data);

  return data;
};

// 최근 7일 히스토리 가져오기 (빈 날짜 포함)
export const getLast7DaysHistory = (): HistoryEntry[] => {
  const data = loadData();
  const result: HistoryEntry[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const entry = data.history.find(h => h.date === dateStr);
    result.push({
      date: dateStr,
      count: entry?.count ?? 0,
    });
  }

  return result;
};
