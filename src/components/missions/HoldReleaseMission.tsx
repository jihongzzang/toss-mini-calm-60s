/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
`;

const guideStyle = css`
  margin-bottom: 40px;
  text-align: center;
`;

const holdButtonStyle = (isPressed: boolean) => css`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${isPressed ? '#3182F6' : '#E5E8EB'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  touch-action: none;

  &:active {
    transform: scale(0.98);
  }
`;

const gaugeContainerStyle = css`
  position: relative;
  width: 200px;
  height: 200px;
`;

const gaugeBackgroundStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #E5E8EB;
`;

const fillAnimation = (progress: number) => keyframes`
  from {
    background: conic-gradient(#3182F6 0deg, #E5E8EB 0deg);
  }
  to {
    background: conic-gradient(#3182F6 ${progress * 360}deg, #E5E8EB ${progress * 360}deg);
  }
`;

const gaugeStyle = (progress: number, isPressed: boolean) => css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #3182F6 ${progress * 360}deg,
    ${isPressed ? '#B8D4FF' : '#E5E8EB'} ${progress * 360}deg
  );
  transition: background 0.1s linear;
`;

const innerCircleStyle = css`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const countStyle = css`
  margin-top: 32px;
`;

const phaseIndicatorStyle = css`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const phaseDotStyle = (isActive: boolean, isCompleted: boolean) => css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${isCompleted ? '#3182F6' : isActive ? '#B8D4FF' : '#E5E8EB'};
`;

const progressContainerStyle = css`
  width: 100%;
  margin-top: 40px;
`;

interface HoldReleaseMissionProps {
  onComplete: () => void;
}

const TARGET_COUNT = 10;
const HOLD_DURATION = 4000; // 4초
const RELEASE_DURATION = 2000; // 2초

type Phase = 'ready' | 'holding' | 'releasing';

export default function HoldReleaseMission({ onComplete }: HoldReleaseMissionProps) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [holdProgress, setHoldProgress] = useState(0);
  const [releaseProgress, setReleaseProgress] = useState(0);

  const holdStartTime = useRef<number>(0);
  const releaseStartTime = useRef<number>(0);
  const animationFrame = useRef<number>(0);

  const progress = (count / TARGET_COUNT) * 100;

  const updateHoldProgress = useCallback(() => {
    const elapsed = Date.now() - holdStartTime.current;
    const newProgress = Math.min(elapsed / HOLD_DURATION, 1);
    setHoldProgress(newProgress);

    if (newProgress >= 1) {
      // Hold 완료 → Release 단계로
      setPhase('releasing');
      releaseStartTime.current = Date.now();
      animationFrame.current = requestAnimationFrame(updateReleaseProgress);
    } else {
      animationFrame.current = requestAnimationFrame(updateHoldProgress);
    }
  }, []);

  const updateReleaseProgress = useCallback(() => {
    const elapsed = Date.now() - releaseStartTime.current;
    const newProgress = Math.min(elapsed / RELEASE_DURATION, 1);
    setReleaseProgress(newProgress);

    if (newProgress >= 1) {
      // Release 완료 → 카운트 증가
      setCount(prev => prev + 1);
      setPhase('ready');
      setHoldProgress(0);
      setReleaseProgress(0);
    } else {
      animationFrame.current = requestAnimationFrame(updateReleaseProgress);
    }
  }, []);

  const handlePressStart = useCallback(() => {
    if (phase !== 'ready') return;

    setPhase('holding');
    holdStartTime.current = Date.now();
    animationFrame.current = requestAnimationFrame(updateHoldProgress);
  }, [phase, updateHoldProgress]);

  const handlePressEnd = useCallback(() => {
    if (phase === 'holding') {
      // 중간에 손 떼면 리셋
      cancelAnimationFrame(animationFrame.current);
      setPhase('ready');
      setHoldProgress(0);
    }
  }, [phase]);

  useEffect(() => {
    if (count >= TARGET_COUNT) {
      onComplete();
    }
  }, [count, onComplete]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  const getGuideText = () => {
    switch (phase) {
      case 'ready':
        return '버튼을 누르고 유지하세요';
      case 'holding':
        return '계속 누르고 있어요...';
      case 'releasing':
        return '잠시 기다려주세요...';
    }
  };

  const displayProgress = phase === 'holding' ? holdProgress : phase === 'releasing' ? 1 : 0;

  return (
    <div css={containerStyle}>
      <div css={guideStyle}>
        <Text typography="t4" fontWeight="medium" color="#333D4B">
          {getGuideText()}
        </Text>
      </div>

      <div
        css={gaugeContainerStyle}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <div css={gaugeBackgroundStyle} />
        <div css={gaugeStyle(displayProgress, phase === 'holding')} />
        <div css={innerCircleStyle}>
          <Text typography="t1" fontWeight="bold" color={phase === 'holding' ? '#3182F6' : '#333D4B'}>
            {count}
          </Text>
          <Text typography="t6" color="#8B95A1" style={{ marginTop: 4 }}>
            / {TARGET_COUNT}
          </Text>
        </div>
      </div>

      <div css={countStyle}>
        <Text typography="t5" color="#6B7684">
          {TARGET_COUNT - count}회 남음
        </Text>
      </div>

      <div css={phaseIndicatorStyle}>
        <div css={phaseDotStyle(phase === 'holding', phase === 'releasing')} />
        <div css={phaseDotStyle(phase === 'releasing', false)} />
      </div>

      <div css={progressContainerStyle}>
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}
