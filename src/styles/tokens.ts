/**
 * Design tokens — Toss Design System color palette.
 *
 * 미션 전용 색상(화산 레드, 밤하늘 블루, 식물 그린 등)은
 * config/missionConfig.ts에 별도 관리.
 */

/* ───────── Primary ───────── */
export const primary = '#3182F6';
export const primaryLight = '#E8F3FF';
export const primarySelected = '#F2F7FF';
export const primaryBorder = '#B8D4FF';

/* ───────── Text ───────── */
export const textPrimary = '#333D4B';
export const textSecondary = '#6B7684';
export const textMuted = '#8B95A1';

/* ───────── Surface / Background ───────── */
export const surface = '#F8F9FA';
export const surfaceAlt = '#F2F4F6';

/* ───────── Border ───────── */
export const border = '#E5E8EB';
export const borderLight = '#f0f0f0';

/* ───────── Semantic ───────── */
export const success = '#4CAF50';
export const danger = '#F04452';
export const warningAlt = '#FF6B6B';

/* ───────── Convenience object ───────── */
export const colors = {
  primary,
  primaryLight,
  primarySelected,
  primaryBorder,
  textPrimary,
  textSecondary,
  textMuted,
  surface,
  surfaceAlt,
  border,
  borderLight,
  success,
  danger,
  warningAlt,
} as const;
