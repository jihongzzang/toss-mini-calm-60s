/**
 * 미션별 게임 파라미터
 */

/* ───────── SlowTap ───────── */

export const SLOW_TAP_CONFIG = {
  targetCount: 30,
  minInterval: 1500,
  cooldown: 2000,
} as const;

/* ───────── HoldRelease ───────── */

export const HOLD_RELEASE_CONFIG = {
  targetCount: 10,
  holdDuration: 4000,
  releaseDuration: 2000,
  bloomDelay: 800,
  flowerColors: [
    '#F48FB1', '#CE93D8', '#FFB74D', '#81C784', '#90CAF9',
    '#FFAB91', '#80DEEA', '#A5D6A7', '#EF9A9A', '#B39DDB',
  ],
  leafGreen: '#66BB6A',
  stemGreen: '#4CAF50',
} as const;

/* ───────── RapidTap ───────── */

export const RAPID_TAP_CONFIG = {
  decayRate: 0.008,
  decayInterval: 100,
  tapIncrease: 0.06,
  eruptionThreshold: 0.85,
  comboThresholds: [
    { tps: 8, message: '미쳤다!!!🤯' },
    { tps: 6, message: '불타오르는중🔥' },
    { tps: 4, message: '대단해요!!' },
    { tps: 2, message: '좋아요!' },
  ],
  crackPaths: [
    'M110 50 Q105 80 115 110',
    'M90 60 Q95 90 85 120',
    'M130 55 Q120 85 130 115',
    'M100 70 Q92 100 100 130',
  ],
  eruptionColors: ['#FFC107', '#FFEB3B', '#FF6D00', '#FF8A65', '#D32F2F'],
} as const;

/** RapidTap 콤보 메시지 반환 */
export function getComboMessage(tps: number): string {
  for (const t of RAPID_TAP_CONFIG.comboThresholds) {
    if (tps >= t.tps) return t.message;
  }
  return '';
}

/* ───────── Grounding ───────── */

export const GROUNDING_CONFIG = {
  seeCount: 3,
  hearCount: 2,
  feelCount: 1,
  totalRequired: 6,
  seeOptions: [
    '시계', '창문', '모니터', '책', '컵',
    '손가락', '조명', '벽', '신발', '식물',
    '가방', '충전기', '의자', '문', '포스터',
  ],
  hearOptions: [
    '에어컨 소리', '키보드 소리', '새소리', '시계 소리', '바람 소리',
    '숨소리', '자동차 소리', '발소리', '음악', '선풍기 소리',
    '빗소리', '물 흐르는 소리',
  ],
  feelOptions: [
    '발바닥의 바닥', '손 위의 공기', '의자에 닿는 등', '옷의 감촉', '손의 온기',
    '머리카락', '입술의 감각', '심장 박동', '숨이 나가는 느낌',
  ],
  sectionColors: {
    see: 'rgba(129, 199, 132, 0.06)',
    hear: 'rgba(165, 214, 167, 0.08)',
    feel: 'rgba(200, 230, 201, 0.10)',
  } as Record<string, string>,
  burstColors: ['#4CAF50', '#81C784', '#FFD93D', '#6BCB77', '#A5D6A7'],
} as const;
