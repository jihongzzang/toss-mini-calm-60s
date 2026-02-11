/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useCallback, useRef } from 'react';
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

const guideStyle = css`
  margin-bottom: 40px;
  text-align: center;
`;

const breatheAnimation = keyframes`
  0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(49,130,246,0.3); }
  50%  { transform: scale(1.08); box-shadow: 0 0 0 20px rgba(49,130,246,0); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(49,130,246,0.3); }
`;

const rippleAnimation = keyframes`
  0% { transform: scale(0); opacity: 0.5; }
  100% { transform: scale(3); opacity: 0; }
`;

const countBounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const tapAreaStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const tapButtonStyle = (canTap: boolean, progressColor: string) => css`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${canTap ? progressColor : '#E5E8EB'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${canTap ? 'pointer' : 'default'};
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  position: relative;
  z-index: 1;
  overflow: hidden;

  ${canTap && `animation: ${breatheAnimation} 4s ease-in-out infinite;`}
`;

const rippleStyle = css`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: ${rippleAnimation} 0.6s ease-out forwards;
  pointer-events: none;
  z-index: 2;
`;

const countStyle = css`
  margin-top: 32px;
`;

const countNumberStyle = (animate: boolean) => css`
  ${animate && `animation: ${countBounce} 0.3s ease-out;`}
`;

const progressContainerStyle = css`
  width: 100%;
  margin-top: 40px;
`;

const warningStyle = css`
  margin-top: 16px;
  height: 24px;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const warningTextStyle = css`
  animation: ${fadeIn} 0.2s ease-out;
`;

const encourageMsgStyle = css`
  animation: ${fadeIn} 0.3s ease-out;
  text-align: center;
`;

const ENCOURAGE_MESSAGES = [
  '좋아요, 이 리듬이에요 🌊',
  '호흡이 편안해지고 있어요',
  '천천히, 잘하고 있어요',
  '지금 이 순간에 집중해 봐요',
  '마음이 차분해지고 있어요',
  '한 번의 터치가 쉼이에요 ✨',
  '깊게 들이쉬고 내쉬어요',
  '조금씩 안정되고 있어요',
  '이 속도가 딱 좋아요 👍',
  '고요함이 다가오고 있어요',
  '터치 하나에 긴장 하나가 풀려요',
  '잘하고 있어요, 계속 이어가요',
  '이 느낌을 기억해요',
  '마음이 가벼워지고 있어요',
  '자신에게 쉼을 주는 중이에요 🍃',
];

function getRandomMessage(prevIndex: number): [string, number] {
  let idx: number;
  do { idx = Math.floor(Math.random() * ENCOURAGE_MESSAGES.length); } while (idx === prevIndex);
  return [ENCOURAGE_MESSAGES[idx], idx];
}

interface SlowTapMissionProps {
  onComplete: () => void;
}

const TARGET_COUNT = 30;
const MIN_INTERVAL = 1500;

interface Ripple {
  id: number;
}

function getProgressColor(progress: number): string {
  const r = Math.round(49 + (255 - 49) * progress);
  const g = Math.round(130 + (107 - 130) * progress);
  const b = Math.round(246 + (107 - 246) * progress);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function SlowTapMission({ onComplete }: SlowTapMissionProps) {
  const [count, setCount] = useState(0);
  const [canTap, setCanTap] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [animateCount, setAnimateCount] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState('');
  const lastTapTime = useRef<number>(0);
  const rippleIdRef = useRef(0);
  const prevMsgIndexRef = useRef(-1);

  const progress = count / TARGET_COUNT;
  const progressColor = getProgressColor(count / TARGET_COUNT);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const interval = now - lastTapTime.current;

    if (lastTapTime.current > 0 && interval < MIN_INTERVAL) {
      setShowWarning(true);
      haptic.light();
      setTimeout(() => setShowWarning(false), 1500);
      return;
    }

    lastTapTime.current = now;
    haptic.tap();

    // 리플 추가
    const newRipple = { id: rippleIdRef.current++ };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    // 카운트 증가 + 바운스 애니메이션
    setCount(prev => prev + 1);
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 300);

    // 격려 메시지 업데이트
    const [msg, idx] = getRandomMessage(prevMsgIndexRef.current);
    prevMsgIndexRef.current = idx;
    setEncourageMsg(msg);

    setCanTap(false);
    setTimeout(() => {
      setCanTap(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (count >= TARGET_COUNT) {
      haptic.success();
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div css={containerStyle}>
      <div css={guideStyle}>
        {!canTap && encourageMsg ? (
          <div key={encourageMsg} css={encourageMsgStyle}>
            <Text typography="t4" fontWeight="medium" color="#3182F6">
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color="#333D4B">
            천천히 터치해 봐요
          </Text>
        )}
      </div>

      <div css={tapAreaStyle}>
        <div css={tapButtonStyle(canTap, progressColor)} onClick={canTap ? handleTap : undefined}>
          {ripples.map(ripple => (
            <div key={ripple.id} css={rippleStyle} />
          ))}
          <div css={countNumberStyle(animateCount)}>
            <Text typography="t1" fontWeight="bold" color="#fff">
              {count}
            </Text>
          </div>
          <Text typography="t6" color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
            / {TARGET_COUNT}
          </Text>
        </div>
      </div>

      <div css={countStyle}>
        <Text typography="t5" color="#6B7684">
          {TARGET_COUNT - count}회 남음
        </Text>
      </div>

      <div css={warningStyle}>
        {showWarning && (
          <div css={warningTextStyle}>
            <Text typography="t6" color="#F04452">
              조금 더 천천히 터치해주세요
            </Text>
          </div>
        )}
      </div>

      <div css={progressContainerStyle}>
        <ProgressBar progress={progress} size="normal" />
      </div>
    </div>
  );
}
