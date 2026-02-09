// 감정 타입 (6가지)
export type Mood = 'anxiety' | 'anger' | 'lethargy' | 'focus' | 'tension' | 'down';

// 미션 모드 타입 (3가지)
export type MissionMode = 'slow_tap' | 'hold_release' | 'grounding_321';

// 감정 라벨 매핑
export const MOOD_LABELS: Record<Mood, string> = {
  anxiety: '불안',
  anger: '짜증',
  lethargy: '무기력',
  focus: '집중 안됨',
  tension: '긴장됨',
  down: '다운됨',
};

// 미션 모드 정보
export const MISSION_INFO: Record<MissionMode, {
  label: string;
  description: string;
  recommendedMoods: Mood[];
}> = {
  slow_tap: {
    label: 'Slow Tap',
    description: '2초 간격으로 천천히 터치 (30회)',
    recommendedMoods: ['anxiety', 'tension', 'down'],
  },
  hold_release: {
    label: 'Hold & Release',
    description: '4초 누르고 2초 쉬기 (10회)',
    recommendedMoods: ['anger', 'tension'],
  },
  grounding_321: {
    label: '3-2-1 Grounding',
    description: '보이는 것 3개, 들리는 것 2개, 느껴지는 것 1개',
    recommendedMoods: ['focus', 'anxiety'],
  },
};

// 감정별 추천 미션 매핑
export const MOOD_RECOMMENDED_MISSION: Record<Mood, MissionMode> = {
  anxiety: 'slow_tap',
  anger: 'hold_release',
  lethargy: 'slow_tap',
  focus: 'grounding_321',
  tension: 'hold_release',
  down: 'slow_tap',
};

// 히스토리 엔트리
export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  count: number;
}

// 저장 데이터 구조
export interface SaveData {
  version: number;
  lastCompletedDate: string | null;
  todayCount: number;
  streak: number;
  history: HistoryEntry[];
  moodStats: Record<Mood, number>;
  modeStats: Record<MissionMode, number>;
}

// 완료 후 액션 타입
export type CompleteAction = 'water' | 'window' | 'walk';

export const COMPLETE_ACTIONS: Record<CompleteAction, string> = {
  water: '물 마시기',
  window: '창문 열기',
  walk: '10걸음 걷기',
};
