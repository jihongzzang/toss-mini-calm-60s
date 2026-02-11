/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';
import { haptic } from '../../utils/haptic';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const guideStyle = css`
  margin-bottom: 40px;
  text-align: center;
  min-height: 32px;
`;

const guideTextStyle = css`
  transition: opacity 0.3s ease;
`;

const gaugeWrapperStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ambientGlowStyle = (intensity: number) => css`
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(49,130,246,${0.15 * intensity}) 0%, transparent 70%);
  transition: background 0.3s;
  pointer-events: none;
`;

const gaugeContainerStyle = (scale: number) => css`
  position: relative;
  width: 200px;
  height: 200px;
  transform: scale(${scale});
  transition: transform 0.1s linear;
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

const gaugeStyle = (progress: number, isPressed: boolean, holdColor: string) => css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    ${holdColor} ${progress * 360}deg,
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

const countBounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const countAnimStyle = (animate: boolean) => css`
  ${animate && `animation: ${countBounce} 0.3s ease-out;`}
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
  transition: background 0.3s ease;
`;

const progressContainerStyle = css`
  width: 100%;
  margin-top: 40px;
`;

const phaseMessageStyle = css`
  margin-top: 12px;
  min-height: 20px;
`;

const encourageTextAnim = css`
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ENCOURAGE_MESSAGES = [
  '호흡이 깊어지고 있어요 🌊',
  '잘하고 있어요, 이 느낌 그대로',
  '몸이 이완되고 있어요',
  '마음이 한결 가벼워지고 있어요',
  '숨이 편안해지고 있어요 ✨',
  '긴장이 녹고 있어요',
  '깊은 고요함이 찾아와요',
  '한 걸음 더 가까워지고 있어요',
  '내 안의 평화를 느껴봐요',
  '좋은 리듬이에요 👍',
  '마음의 짐을 내려놓는 중이에요',
  '이 순간에만 집중해 봐요',
  '당신의 시간이에요 🍃',
  '천천히, 자연스럽게',
  '몸과 마음이 하나가 되고 있어요',
];

function getRandomMessage(prevIndex: number): [string, number] {
  let idx: number;
  do { idx = Math.floor(Math.random() * ENCOURAGE_MESSAGES.length); } while (idx === prevIndex);
  return [ENCOURAGE_MESSAGES[idx], idx];
}

interface HoldReleaseMissionProps {
  onComplete: () => void;
}

const TARGET_COUNT = 10;
const HOLD_DURATION = 4000;
const RELEASE_DURATION = 2000;

type Phase = 'ready' | 'holding' | 'releasing';

function getHoldColor(progress: number): string {
  const r = Math.round(184 - 158 * progress);
  const g = Math.round(212 - 154 * progress);
  const b = Math.round(255 - 133 * progress);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function HoldReleaseMission({ onComplete }: HoldReleaseMissionProps) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [holdProgress, setHoldProgress] = useState(0);
  const [releaseProgress, setReleaseProgress] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState('');

  const holdStartTime = useRef<number>(0);
  const releaseStartTime = useRef<number>(0);
  const animationFrame = useRef<number>(0);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMsgIndexRef = useRef(-1);

  const progress = count / TARGET_COUNT;

  const updateHoldProgress = useCallback(() => {
    const elapsed = Date.now() - holdStartTime.current;
    const newProgress = Math.min(elapsed / HOLD_DURATION, 1);
    setHoldProgress(newProgress);

    if (newProgress >= 1) {
      setPhase('releasing');
      releaseStartTime.current = Date.now();
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      haptic.release();
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
      setCount(prev => prev + 1);
      setAnimateCount(true);
      setTimeout(() => setAnimateCount(false), 300);

      // 격려 메시지 업데이트
      const [msg, idx] = getRandomMessage(prevMsgIndexRef.current);
      prevMsgIndexRef.current = idx;
      setEncourageMsg(msg);

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
    haptic.medium();
    animationFrame.current = requestAnimationFrame(updateHoldProgress);

    hapticInterval.current = setInterval(() => {
      haptic.light();
    }, 500);
  }, [phase, updateHoldProgress]);

  const handlePressEnd = useCallback(() => {
    if (phase === 'holding') {
      cancelAnimationFrame(animationFrame.current);
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      setPhase('ready');
      setHoldProgress(0);
    }
  }, [phase]);

  useEffect(() => {
    if (count >= TARGET_COUNT) {
      haptic.success();
      onComplete();
    }
  }, [count, onComplete]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrame.current);
      if (hapticInterval.current) clearInterval(hapticInterval.current);
    };
  }, []);

  const getGuideText = () => {
    switch (phase) {
      case 'ready':
        return '버튼을 꾹 눌러봐요';
      case 'holding':
        return '계속 누르고 있어요...';
      case 'releasing':
        return '천천히 내쉬어요...';
    }
  };

  const displayProgress = phase === 'holding' ? holdProgress : phase === 'releasing' ? 1 : 0;
  const holdColor = phase === 'holding' ? getHoldColor(holdProgress) : '#3182F6';

  // 호흡 스케일: hold시 1→1.2, release시 1.2→1
  const breathScale = phase === 'holding'
    ? 1 + 0.2 * holdProgress
    : phase === 'releasing'
    ? 1.2 - 0.2 * releaseProgress
    : 1;

  const glowIntensity = phase === 'holding' ? holdProgress : phase === 'releasing' ? 1 - releaseProgress : 0;

  return (
    <div css={containerStyle}>
      <div css={guideStyle}>
        {phase === 'ready' && encourageMsg ? (
          <div key={encourageMsg} css={encourageTextAnim}>
            <Text typography="t4" fontWeight="medium" color="#3182F6" css={guideTextStyle}>
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color="#333D4B" css={guideTextStyle}>
            {getGuideText()}
          </Text>
        )}
      </div>

      <div css={gaugeWrapperStyle}>
        <div css={ambientGlowStyle(glowIntensity)} />
        <div
          css={gaugeContainerStyle(breathScale)}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          role="button"
          aria-label={`꾹 누르기 ${count}/${TARGET_COUNT}`}
        >
          <div css={gaugeBackgroundStyle} />
          <div css={gaugeStyle(displayProgress, phase === 'holding', holdColor)} />
          <div css={innerCircleStyle}>
            <div css={countAnimStyle(animateCount)}>
              <Text typography="t1" fontWeight="bold" color={phase === 'holding' ? '#3182F6' : '#333D4B'}>
                {count}
              </Text>
            </div>
            <Text typography="t6" color="#8B95A1" style={{ marginTop: 4 }}>
              / {TARGET_COUNT}
            </Text>
          </div>
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

      <div css={phaseMessageStyle}>
        {phase === 'holding' && (
          <Text typography="t7" color="#3182F6" css={css`animation: ${fadeInUp} 0.3s ease-out;`}>
            {Math.ceil((HOLD_DURATION - holdProgress * HOLD_DURATION) / 1000)}초 남음
          </Text>
        )}
        {phase === 'releasing' && (
          <Text typography="t7" color="#8B95A1" css={css`animation: ${fadeInUp} 0.3s ease-out;`}>
            쉬는 중...
          </Text>
        )}
      </div>

      <div css={progressContainerStyle}>
        <ProgressBar progress={progress} size="normal" />
      </div>
    </div>
  );
}
