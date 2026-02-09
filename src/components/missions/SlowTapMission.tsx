/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useCallback, useRef } from 'react';
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

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const tapButtonStyle = (canTap: boolean) => css`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${canTap ? '#3182F6' : '#E5E8EB'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${canTap ? 'pointer' : 'default'};
  transition: background 0.3s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  ${canTap && `
    animation: ${pulseAnimation} 2s ease-in-out infinite;
  `}

  &:active {
    ${canTap && `
      transform: scale(0.95);
    `}
  }
`;

const countStyle = css`
  margin-top: 32px;
`;

const progressContainerStyle = css`
  width: 100%;
  margin-top: 40px;
`;

const warningStyle = css`
  margin-top: 16px;
  height: 24px;
`;

interface SlowTapMissionProps {
  onComplete: () => void;
}

const TARGET_COUNT = 30;
const MIN_INTERVAL = 1500; // 1.5초 이상 간격 권장

export default function SlowTapMission({ onComplete }: SlowTapMissionProps) {
  const [count, setCount] = useState(0);
  const [canTap, setCanTap] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const lastTapTime = useRef<number>(0);

  const progress = (count / TARGET_COUNT) * 100;

  const handleTap = useCallback(() => {
    const now = Date.now();
    const interval = now - lastTapTime.current;

    if (lastTapTime.current > 0 && interval < MIN_INTERVAL) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 1500);
      return;
    }

    lastTapTime.current = now;
    setCount(prev => prev + 1);
    setCanTap(false);

    // 2초 후 다시 탭 가능
    setTimeout(() => {
      setCanTap(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (count >= TARGET_COUNT) {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div css={containerStyle}>
      <div css={guideStyle}>
        <Text typography="t4" fontWeight="medium" color="#333D4B">
          {canTap ? '천천히 터치하세요' : '잠시 기다려주세요...'}
        </Text>
      </div>

      <div css={tapButtonStyle(canTap)} onClick={canTap ? handleTap : undefined}>
        <Text typography="t1" fontWeight="bold" color="#fff">
          {count}
        </Text>
        <Text typography="t6" color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
          / {TARGET_COUNT}
        </Text>
      </div>

      <div css={countStyle}>
        <Text typography="t5" color="#6B7684">
          {TARGET_COUNT - count}회 남음
        </Text>
      </div>

      <div css={warningStyle}>
        {showWarning && (
          <Text typography="t6" color="#F04452">
            조금 더 천천히 터치해주세요
          </Text>
        )}
      </div>

      <div css={progressContainerStyle}>
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}
