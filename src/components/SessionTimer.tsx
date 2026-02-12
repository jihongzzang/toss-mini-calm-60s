/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useRef } from 'react';
import { Text } from '@toss/tds-mobile';
import { haptic } from '../utils/haptic';
import { primary, textPrimary, border, danger } from '../styles/tokens';

const timerContainerStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0 8px;
  position: relative;
`;

const svgStyle = css`
  transform: rotate(-90deg);
`;

const timeTextStyle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const pulseWarning = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const warningPulseStyle = css`
  animation: ${pulseWarning} 1s ease-in-out infinite;
`;

interface SessionTimerProps {
  durationMs?: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  size?: number;
}

export default function SessionTimer({
  durationMs = 60000,
  onTimeUp,
  isPaused = false,
  size = 100,
}: SessionTimerProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const startTimeRef = useRef(Date.now());
  const pausedElapsedRef = useRef(0);
  const hasCalledTimeUp = useRef(false);
  const hasWarned = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (isPaused) {
      pausedElapsedRef.current = Date.now() - startTimeRef.current;
      return;
    }

    startTimeRef.current = Date.now() - pausedElapsedRef.current;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(durationMs - elapsed, 0);
      setRemainingMs(remaining);

      if (remaining <= 10000 && !hasWarned.current) {
        hasWarned.current = true;
        haptic.heavy();
      }

      if (remaining <= 0 && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        haptic.success();
        onTimeUpRef.current();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [durationMs, isPaused]);

  const fraction = remainingMs / durationMs;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - fraction);

  const seconds = Math.ceil(remainingMs / 1000);
  const displayMin = Math.floor(seconds / 60);
  const displaySec = seconds % 60;
  const timeStr = `${displayMin}:${String(displaySec).padStart(2, '0')}`;

  const isWarning = remainingMs <= 10000;
  const strokeColor = isWarning
    ? `rgb(${Math.round(240 - (remainingMs / 10000) * (240 - 49))}, ${Math.round(68 + (remainingMs / 10000) * (130 - 68))}, ${Math.round(82 + (remainingMs / 10000) * (246 - 82))})`
    : primary;

  const viewBox = `0 0 ${size} ${size}`;
  const center = size / 2;

  return (
    <div css={timerContainerStyle} role="timer" aria-label={`남은 시간 ${timeStr}`}>
      <svg width={size} height={size} viewBox={viewBox} css={svgStyle} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={border}
          strokeWidth="4"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          css={css`
            transition: stroke-dashoffset 0.1s linear, stroke 1s ease;
          `}
        />
      </svg>
      <div css={[timeTextStyle, isWarning && warningPulseStyle]}>
        <Text
          typography="t5"
          fontWeight="bold"
          color={isWarning ? danger : textPrimary}
        >
          {timeStr}
        </Text>
      </div>
    </div>
  );
}
