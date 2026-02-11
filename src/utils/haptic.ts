import { generateHapticFeedback } from '@apps-in-toss/web-bridge';

/**
 * Toss generateHapticFeedback 기반 햅틱 유틸리티
 *
 * 사용 가능한 타입:
 *   tickWeak, tap, tickMedium, softMedium,
 *   basicWeak, basicMedium, success, error, wiggle, confetti
 */

const fire = (
  type: Parameters<typeof generateHapticFeedback>[0]['type'],
) => {
  generateHapticFeedback({ type }).catch(() => {
    // 네이티브 브릿지 불가 환경(데스크톱 브라우저 등)에서는 무시
  });
};

export const haptic = {
  /** 아주 가벼운 진동 – 감정 선택, 액션 선택 등 */
  light: () => fire('tickWeak'),

  /** 일반 탭 진동 – 체크리스트 체크, 단일 탭 등 */
  tap: () => fire('tap'),

  /** 중간 강도 – 시작 버튼, 모드 선택 등 */
  medium: () => fire('tickMedium'),

  /** 무거운 진동 – 연타 고강도, 꾹 누르기 등 */
  heavy: () => fire('basicMedium'),

  /** 부드러운 중간 – 홀드 릴리즈 해제 시 */
  soft: () => fire('softMedium'),

  /** 성공 피드백 – 미션 완료, 세션 완료, 섹션 완료 */
  success: () => fire('success'),

  /** 에러 피드백 */
  error: () => fire('error'),

  /** 흔들림 – 타이머 종료 임박 등 */
  wiggle: () => fire('wiggle'),

  /** 축하 – 완료 화면 진입 */
  confetti: () => fire('confetti'),

  /** 릴리즈 (soft + 딜레이 후 tap) */
  release: () => {
    fire('softMedium');
    setTimeout(() => fire('tap'), 80);
  },
};
