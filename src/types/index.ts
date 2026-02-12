// 감정 타입 (6가지)
export type Mood = 'anxiety' | 'anger' | 'lethargy' | 'focus' | 'tension' | 'down';

// 미션 모드 타입 (4가지)
export type MissionMode = 'slow_tap' | 'hold_release' | 'grounding_321' | 'rapid_tap';

// 감정 라벨 매핑
export const MOOD_LABELS: Record<Mood, string> = {
  anxiety: '불안',
  anger: '짜증',
  lethargy: '무기력',
  focus: '집중 안됨',
  tension: '긴장됨',
  down: '다운됨',
};

// 감정 아이콘 매핑
export const MOOD_ICONS: Record<Mood, string> = {
  anxiety: '😰',
  anger: '😤',
  lethargy: '😶',
  focus: '🌀',
  tension: '😬',
  down: '😢',
};

// 미션 모드 정보
export interface MissionInfo {
  label: string;
  icon: string;
  description: string;
  recommendedMoods: Mood[];
}

export const MISSION_INFO: Record<MissionMode, MissionInfo> = {
  slow_tap: {
    label: '천천히 터치',
    icon: '🫧',
    description: '2초 간격으로 천천히 터치 (30회)',
    recommendedMoods: ['anxiety', 'tension', 'down'],
  },
  hold_release: {
    label: '꾹 누르기',
    icon: '💎',
    description: '4초 누르고 2초 쉬기 (10회)',
    recommendedMoods: ['anger', 'tension'],
  },
  grounding_321: {
    label: '오감 집중',
    icon: '🌿',
    description: '주변을 느끼며 마음 가라앉히기',
    recommendedMoods: ['focus', 'anxiety'],
  },
  rapid_tap: {
    label: '연타 모드',
    icon: '⚡',
    description: '60초 안에 마음껏 연타 (스트레스를 풀어요)',
    recommendedMoods: ['anger', 'tension', 'lethargy'],
  },
};

// 감정별 추천 미션 매핑
export const MOOD_RECOMMENDED_MISSION: Record<Mood, MissionMode> = {
  anxiety: 'slow_tap',
  anger: 'rapid_tap',
  lethargy: 'rapid_tap',
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

// 사운드 타입
export type AmbientSoundType = 'rain' | 'wind' | 'forest' | 'ocean' | 'rumble' | 'steam';

export interface MissionSoundConfig {
  layers: Array<{ type: AmbientSoundType; volume: number }>;
}

export const MISSION_SOUND_CONFIG: Record<MissionMode, MissionSoundConfig> = {
  slow_tap: { layers: [{ type: 'rain', volume: 0.3 }] },
  hold_release: { layers: [{ type: 'wind', volume: 0.2 }, { type: 'forest', volume: 0.15 }] },
  grounding_321: { layers: [{ type: 'wind', volume: 0.15 }] },
  rapid_tap: { layers: [{ type: 'rumble', volume: 0.1 }] },
};

// 완료 후 액션 타입
export type CompleteAction = 'water' | 'window' | 'walk';

export const COMPLETE_ACTIONS: Record<CompleteAction, string> = {
  water: '물 마시기',
  window: '창문 열기',
  walk: '10걸음 걷기',
};
