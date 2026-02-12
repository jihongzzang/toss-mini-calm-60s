import { css } from '@emotion/react';

/**
 * iOS/Android 블루 탭 하이라이트 제거.
 * 네이티브 버튼이 아닌 모든 인터랙티브 요소에 적용.
 */
export const tapHighlightReset = css`
  -webkit-tap-highlight-color: transparent;
`;

/**
 * 미션 탭 영역 공통: 탭 하이라이트 제거 + 텍스트 선택 방지.
 */
export const interactiveTapArea = css`
  -webkit-tap-highlight-color: transparent;
  user-select: none;
`;
