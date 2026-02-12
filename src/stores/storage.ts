import type { SaveData, Mood, MissionMode, HistoryEntry } from '../types';

const STORAGE_KEY = 'calm60_save_v1';
const SOUND_MUTED_KEY = 'calm60_sound_muted';

// 사운드 음소거 설정
export const getSoundMuted = (): boolean => {
  return localStorage.getItem(SOUND_MUTED_KEY) === 'true';
};

export const setSoundMuted = (muted: boolean): void => {
  localStorage.setItem(SOUND_MUTED_KEY, String(muted));
};

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
    rapid_tap: 0,
  },
});

// 오늘 날짜 (YYYY-MM-DD, 로컬 기준)
export const getTodayDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 어제 날짜 (YYYY-MM-DD, 로컬 기준)
const getYesterdayDate = (): string => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 날짜를 로컬 YYYY-MM-DD 문자열로
const toLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

    // streak 유효성 검증: 마지막 기록이 어제도 오늘도 아니면 streak 리셋
    const yesterday = getYesterdayDate();
    if (
      data.lastCompletedDate !== today &&
      data.lastCompletedDate !== yesterday
    ) {
      data.streak = 0;
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
  if (data.lastCompletedDate === today) {
    // 같은 날 추가 기록 → streak 유지
  } else if (data.lastCompletedDate === yesterday) {
    // 어제 했음 → streak 증가
    data.streak += 1;
  } else {
    // 연속 끊김 → 1부터 시작
    data.streak = 1;
  }

  // lastCompletedDate 업데이트
  data.lastCompletedDate = today;

  // history 업데이트
  const todayEntry = data.history.find(h => h.date === today);
  if (todayEntry) {
    todayEntry.count += 1;
  } else {
    data.history.push({ date: today, count: 1 });
  }

  // 최근 30일로 trim (7일 → 30일로 확장)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  const cutoff = toLocalDateStr(cutoffDate);
  data.history = data.history.filter(h => h.date >= cutoff);

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
    const dateStr = toLocalDateStr(date);

    const entry = data.history.find(h => h.date === dateStr);
    result.push({
      date: dateStr,
      count: entry?.count ?? 0,
    });
  }

  return result;
};

// 총 완료 횟수
export const getTotalCount = (): number => {
  const data = loadData();
  return Object.values(data.moodStats).reduce((a, b) => a + b, 0);
};
