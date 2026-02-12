/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useCallback, useRef, useMemo } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';
import { SLOW_TAP_CONFIG } from '../../config/missionConfig';
import { useSlowTapGame } from '../../hooks/useSlowTapGame';
import { warningAlt } from '../../styles/tokens';
import { interactiveTapArea } from '../../styles/mixins';

/* ───────── 키프레임 ───────── */

const breatheAnimation = keyframes`
  0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(197,213,232,0.3); }
  50%  { transform: scale(1.06); box-shadow: 0 0 0 20px rgba(197,213,232,0); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(197,213,232,0.3); }
`;

const waterRippleAnimation = keyframes`
  0% { transform: scale(0.3); opacity: 0.6; }
  100% { transform: scale(3); opacity: 0; }
`;

const countBounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const moonReflectionWobble = keyframes`
  0%, 100% { transform: scaleX(1) scaleY(0.3); opacity: 0.15; }
  50% { transform: scaleX(1.15) scaleY(0.25); opacity: 0.1; }
`;

/* ───────── 스타일 ───────── */

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
  background: linear-gradient(180deg, #0A1628 0%, #1B2D4F 60%, #2E4A7A 100%);
  position: relative;
  overflow: hidden;
`;

const guideStyle = css`
  margin-bottom: 40px;
  text-align: center;
  z-index: 2;
`;

const tapAreaStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const tapButtonStyle = (canTap: boolean) => css`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 35%,
    rgba(197,213,232,0.25) 0%,
    rgba(27,45,79,0.9) 50%,
    rgba(10,22,40,1) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${canTap ? 'pointer' : 'default'};
  transition: background 0.3s;
  ${interactiveTapArea}
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: 1px solid rgba(197,213,232,0.15);

  ${canTap && `animation: ${breatheAnimation} 4s ease-in-out infinite;`}
`;

const rippleStyle = (ring: number) => css`
  position: absolute;
  width: ${60 + ring * 30}px;
  height: ${60 + ring * 30}px;
  border-radius: 50%;
  border: 1.5px solid rgba(197,213,232, ${0.5 - ring * 0.12});
  background: transparent;
  animation: ${waterRippleAnimation} ${0.8 + ring * 0.3}s ease-out ${ring * 0.12}s forwards;
  pointer-events: none;
  z-index: 2;
`;

const countStyle = css`
  margin-top: 32px;
  z-index: 2;
`;

const countNumberStyle = (animate: boolean) => css`
  ${animate && `animation: ${countBounce} 0.3s ease-out;`}
`;

const progressContainerStyle = css`
  width: 100%;
  margin-top: 40px;
  z-index: 2;
`;

const warningStyle = css`
  margin-top: 16px;
  height: 24px;
  z-index: 2;
`;

const warningTextStyle = css`
  animation: ${fadeIn} 0.2s ease-out;
`;

const encourageMsgStyle = css`
  animation: ${fadeIn} 0.3s ease-out;
  text-align: center;
`;

/* 달 */
const moonContainerStyle = css`
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 1;
`;

/* 달 반사 */
const moonReflectionStyle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255,253,231,0.2) 0%, transparent 70%);
  animation: ${moonReflectionWobble} 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
`;

/* 별 */
const starStyle = (x: number, y: number, _size: number, delay: number, visible: boolean) => css`
  position: absolute;
  left: ${x}%;
  top: ${y}%;
  opacity: ${visible ? 0.6 : 0};
  transition: opacity 1.5s ease-in;
  z-index: 1;
  animation: ${visible ? twinkle : 'none'} ${3 + delay}s ease-in-out ${delay}s infinite;
`;

/* ───────── 타입 ───────── */

interface SlowTapMissionProps {
  onComplete: () => void;
  onTap?: () => void;
}

interface WaterRipple {
  id: number;
  ring: number;
}

/* ───────── 별 데이터 ───────── */
function generateStars() {
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 3 + Math.random() * 35,
    size: 2 + Math.random() * 3,
    threshold: 0.05 + (i / 14) * 0.85,
    twinkleDelay: Math.random() * 3,
  }));
}

/* ───────── 메인 컴포넌트 ───────── */

export default function SlowTapMission({ onComplete, onTap }: SlowTapMissionProps) {
  const { count, canTap, showWarning, encourageMsg, progress, handleTap: gameTap } = useSlowTapGame(onComplete, onTap);

  const [ripples, setRipples] = useState<WaterRipple[]>([]);
  const [animateCount, setAnimateCount] = useState(false);
  const rippleIdRef = useRef(0);

  const stars = useMemo(generateStars, []);

  const handleTapWithEffects = useCallback(() => {
    const accepted = gameTap();
    if (!accepted) return;

    // 물결 리플 3개 동심원
    const baseId = rippleIdRef.current;
    const newRipples: WaterRipple[] = [
      { id: baseId, ring: 0 },
      { id: baseId + 1, ring: 1 },
      { id: baseId + 2, ring: 2 },
    ];
    rippleIdRef.current += 3;
    setRipples(prev => [...prev, ...newRipples]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => !newRipples.some(nr => nr.id === r.id)));
    }, 1500);

    // 카운트 바운스
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 300);
  }, [gameTap]);

  return (
    <div css={containerStyle}>
      {/* 별 */}
      {stars.map(star => (
        <div key={star.id} css={starStyle(star.x, star.y, star.size, star.twinkleDelay, progress >= star.threshold)}>
          <svg width={star.size * 2} height={star.size * 2} viewBox="0 0 10 10">
            <path d="M5 0 L5.7 3.5 L10 5 L5.7 6.5 L5 10 L4.3 6.5 L0 5 L4.3 3.5 Z" fill="#C5D5E8" />
          </svg>
        </div>
      ))}

      {/* 달 */}
      <div css={moonContainerStyle}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFFDE7" />
              <stop offset="60%" stopColor="#FFE082" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFE082" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="25" cy="25" r="30" fill="url(#moonGlow)" opacity={0.2 + progress * 0.5} />
          <circle cx="25" cy="25" r="12" fill="#FFFDE7" opacity={0.5 + progress * 0.5} />
        </svg>
      </div>

      {/* 가이드 */}
      <div css={guideStyle}>
        {!canTap && encourageMsg ? (
          <div key={encourageMsg} css={encourageMsgStyle}>
            <Text typography="t4" fontWeight="medium" color="#FFE082">
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color="#C5D5E8">
            천천히 터치해 봐요
          </Text>
        )}
      </div>

      {/* 탭 영역 */}
      <div css={tapAreaStyle}>
        <div css={tapButtonStyle(canTap)} onClick={canTap ? handleTapWithEffects : undefined} role="button" aria-label={`천천히 터치 ${count}/${SLOW_TAP_CONFIG.targetCount}`}>
          {/* 달 반사 */}
          <div css={moonReflectionStyle} />

          {/* 물결 리플 */}
          {ripples.map(ripple => (
            <div key={ripple.id} css={rippleStyle(ripple.ring)} />
          ))}

          <div css={countNumberStyle(animateCount)}>
            <Text typography="t1" fontWeight="bold" color="#fff">
              {count}
            </Text>
          </div>
          <Text typography="t6" color="rgba(197,213,232,0.7)" style={{ marginTop: 4 }}>
            / {SLOW_TAP_CONFIG.targetCount}
          </Text>
        </div>
      </div>

      {/* 카운트 */}
      <div css={countStyle}>
        <Text typography="t5" color="#8B9BB5">
          {SLOW_TAP_CONFIG.targetCount - count}회 남음
        </Text>
      </div>

      {/* 경고 */}
      <div css={warningStyle}>
        {showWarning && (
          <div css={warningTextStyle}>
            <Text typography="t6" color={warningAlt}>
              조금 더 천천히 터치해주세요
            </Text>
          </div>
        )}
      </div>

      {/* 진행 바 */}
      <div css={progressContainerStyle}>
        <ProgressBar progress={progress} size="normal" />
      </div>
    </div>
  );
}
