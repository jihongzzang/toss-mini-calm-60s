/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useRef, useMemo, useCallback } from 'react';
import { Text } from '@toss/tds-mobile';
import { RAPID_TAP_CONFIG } from '../../config/missionConfig';
import { useRapidTapGame } from '../../hooks/useRapidTapGame';
import { interactiveTapArea } from '../../styles/mixins';

/* ───────── 키프레임 ───────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-2px, -1px); }
  20% { transform: translate(2px, 1px); }
  30% { transform: translate(-1px, 2px); }
  40% { transform: translate(1px, -2px); }
  50% { transform: translate(-2px, 2px); }
  60% { transform: translate(2px, -1px); }
  70% { transform: translate(-1px, -2px); }
  80% { transform: translate(2px, 1px); }
  90% { transform: translate(-2px, -1px); }
`;

const impactRipple = keyframes`
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
`;

const floatUp = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-80px) scale(0.5); }
`;

const emberFloat = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  50% { transform: translateY(-50px) scale(0.6); opacity: 0.5; }
  100% { transform: translateY(-100px) scale(0.2); opacity: 0; }
`;

const eruptionBurst = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-120px) scale(0); opacity: 0; }
`;

/* ───────── 컬러 ───────── */

function getIntensityColor(intensity: number): string {
  if (intensity < 0.3) return '#546E7A';  // 회색 암석
  if (intensity < 0.6) return '#E65100';  // 주황 용암
  if (intensity < 0.8) return '#D32F2F';  // 빨강
  return '#FFC107';                        // 노란 폭발
}

function getCraterGradient(intensity: number): string {
  const centerColor = intensity < 0.3 ? '#37474F' :
    intensity < 0.6 ? '#E65100' :
    intensity < 0.8 ? '#D32F2F' : '#FFC107';
  const midColor = intensity < 0.3 ? '#546E7A' : '#37474F';
  return `radial-gradient(circle at 50% 50%, ${centerColor} 0%, ${midColor} 55%, #263238 100%)`;
}

/* ───────── 스타일 ───────── */

const containerStyle = (intensity: number) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    #1a1a2e 0%,
    ${intensity > 0.5 ? `rgba(230,81,0, ${intensity * 0.08})` : '#1a1a2e'} 50%,
    #16213e 100%
  );
  transition: background 0.3s;
`;

const guideStyle = css`
  margin-bottom: 24px;
  text-align: center;
  z-index: 2;
`;

const craterStyle = (intensity: number) => css`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: ${getCraterGradient(intensity)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${interactiveTapArea}
  position: relative;
  z-index: 2;
  transition: background 0.15s;
  box-shadow:
    inset 0 0 ${20 + intensity * 40}px rgba(${
      intensity < 0.3 ? '0,0,0' :
      intensity < 0.6 ? '230,81,0' :
      intensity < 0.8 ? '244,67,54' : '255,193,7'
    }, ${0.3 + intensity * 0.4}),
    0 0 ${intensity * 30}px rgba(255, 109, 0, ${intensity * 0.3});

  ${intensity > 0.3 && intensity <= 0.5 && `animation: ${shakeAnimation} 0.5s ease-in-out infinite;`}
  ${intensity > 0.5 && intensity <= 0.7 && `animation: ${shakeAnimation} 0.3s ease-in-out infinite;`}
  ${intensity > 0.7 && `animation: ${shakeAnimation} 0.15s ease-in-out infinite;`}

  &:active {
    transform: scale(0.96);
  }
`;

const rippleStyle = css`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 200, 100, 0.4);
  animation: ${impactRipple} 0.4s ease-out forwards;
  pointer-events: none;
`;

const floatingNumberStyle = css`
  position: absolute;
  pointer-events: none;
  font-weight: bold;
  font-size: 20px;
  color: rgba(255, 200, 100, 0.8);
  animation: ${floatUp} 0.6s ease-out forwards;
  z-index: 3;
`;

const countStyle = css`
  margin-top: 32px;
  z-index: 2;
`;

const comboStyle = css`
  margin-top: 12px;
  min-height: 24px;
  z-index: 2;
`;

const comboTextStyle = css`
  animation: ${fadeIn} 0.15s ease-out;
`;

const meterContainerStyle = css`
  width: 100%;
  margin-top: 32px;
  z-index: 2;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
`;

const meterLabelRowStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const meterBarStyle = css`
  width: 100%;
  height: 14px;
  border-radius: 7px;
  background: #37474F;
  overflow: hidden;
`;

const meterFillStyle = (intensity: number) => css`
  height: 100%;
  width: ${intensity * 100}%;
  background: linear-gradient(90deg, #E65100, #FF6D00, #D32F2F, #FFC107);
  border-radius: 7px;
  transition: width 0.15s;
  ${intensity > 0.6 ? `box-shadow: 0 0 12px rgba(255, 109, 0, 0.6);` : ''}
`;

const meterTicksStyle = css`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  padding: 0 2px;
`;

/* 용암 균열 SVG */
const crackOverlayStyle = css`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
`;

/* 화산재/불씨 파티클 */
const emberStyle = (x: number, duration: number, delay: number) => css`
  position: absolute;
  width: ${3 + Math.random() * 4}px;
  height: ${3 + Math.random() * 4}px;
  border-radius: 50%;
  left: ${x}%;
  bottom: 30%;
  pointer-events: none;
  z-index: 1;
  animation: ${emberFloat} ${duration}s ease-out ${delay}s infinite;
`;

/* 폭발 파티클 */
const eruptionParticleStyle = (angle: number, color: string) => css`
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${color};
  top: 30%;
  left: 50%;
  pointer-events: none;
  z-index: 3;
  animation: ${eruptionBurst} 0.8s ease-out forwards;
  transform: rotate(${angle}deg);
`;

const encourageMsgAnimStyle = css`
  animation: ${fadeIn} 0.2s ease-out;
`;

/* ───────── 타입 ───────── */

interface RapidTapMissionProps {
  onComplete: () => void;
  onIntensityChange?: (intensity: number) => void;
}

interface Ripple { id: number; }
interface FloatingNum { id: number; value: number; }

/* ───────── 메인 컴포넌트 ───────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RapidTapMission({ onComplete: _onComplete, onIntensityChange }: RapidTapMissionProps) {
  const { count, intensity, tps, encourageMsg, showEruption, comboMessage, handleTap: gameHandleTap } = useRapidTapGame(onIntensityChange);

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [floatingNums, setFloatingNums] = useState<FloatingNum[]>([]);

  const rippleIdRef = useRef(0);
  const floatIdRef = useRef(0);

  // 화산재 파티클 데이터 (고정)
  const embers = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      duration: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 2,
      color: RAPID_TAP_CONFIG.eruptionColors[i % RAPID_TAP_CONFIG.eruptionColors.length],
    }))
  , []);

  // 폭발 파티클 각도 (고정)
  const eruptionAngles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (360 / 12) * i + Math.random() * 15,
      color: RAPID_TAP_CONFIG.eruptionColors[Math.floor(Math.random() * RAPID_TAP_CONFIG.eruptionColors.length)],
    }))
  , []);

  const handleTap = useCallback(() => {
    gameHandleTap();

    // 리플 이펙트
    const rippleId = rippleIdRef.current++;
    setRipples(prev => [...prev, { id: rippleId }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 400);

    // 플로팅 숫자
    const currentCount = tps;
    if (currentCount >= 3) {
      const floatId = floatIdRef.current++;
      setFloatingNums(prev => [...prev, { id: floatId, value: currentCount }]);
      setTimeout(() => {
        setFloatingNums(prev => prev.filter(f => f.id !== floatId));
      }, 600);
    }
  }, [gameHandleTap, tps]);

  return (
    <div css={containerStyle(intensity)}>
      {/* 화산재 파티클 */}
      {embers.map(e => (
        <div
          key={e.id}
          css={emberStyle(e.x, e.duration, e.delay)}
          style={{
            background: e.color,
            opacity: intensity > 0.4 ? 0.8 : 0,
          }}
        />
      ))}

      {/* 가이드 */}
      <div css={guideStyle}>
        {encourageMsg ? (
          <div key={encourageMsg} css={encourageMsgAnimStyle}>
            <Text typography="t4" fontWeight="medium" color={getIntensityColor(intensity)}>
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color="#B0BEC5">
            마음껏 두드려요!
          </Text>
        )}
      </div>

      {/* 화산 분화구 */}
      <div css={craterStyle(intensity)} onClick={handleTap} role="button" aria-label={`빠르게 터치 ${count}탭`}>
        {/* 용암 균열 */}
        {intensity > 0.3 && (
          <svg css={crackOverlayStyle} viewBox="0 0 220 220">
            <defs>
              <filter id="lavaGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {RAPID_TAP_CONFIG.crackPaths.map((path, i) => (
              <path
                key={i}
                d={path}
                stroke={intensity > 0.6 ? '#FF6D00' : '#E65100'}
                strokeWidth={1 + intensity * 2}
                fill="none"
                opacity={Math.min(1, (intensity - 0.3) * 3)}
                filter="url(#lavaGlow)"
              />
            ))}
          </svg>
        )}

        {ripples.map(ripple => (
          <div key={ripple.id} css={rippleStyle} />
        ))}
        {floatingNums.map(f => (
          <div key={f.id} css={floatingNumberStyle}>
            +{f.value}
          </div>
        ))}

        <Text typography="t1" fontWeight="bold" color="#fff">
          {count}
        </Text>
        <Text typography="t6" color="rgba(255,255,255,0.6)" style={{ marginTop: 4 }}>
          탭
        </Text>
      </div>

      {/* 폭발 파티클 */}
      {showEruption && eruptionAngles.map(p => (
        <div key={p.id} css={eruptionParticleStyle(p.angle, p.color)} />
      ))}

      {/* TPS */}
      <div css={countStyle}>
        <Text typography="t5" color="#78909C">
          {tps > 0 ? `${tps}회/초` : '터치를 시작해요'}
        </Text>
      </div>

      {/* 콤보 */}
      <div css={comboStyle}>
        {comboMessage && (
          <div css={comboTextStyle}>
            <Text typography="t4" fontWeight="bold" color={getIntensityColor(intensity)}>
              {comboMessage}
            </Text>
          </div>
        )}
      </div>

      {/* 마그마 미터 */}
      <div css={meterContainerStyle}>
        <div css={meterLabelRowStyle}>
          <Text typography="t6" fontWeight="bold" color="#B0BEC5">
            🌋 마그마
          </Text>
          <Text typography="t6" fontWeight="bold" color={getIntensityColor(intensity)}>
            {Math.round(intensity * 100)}%
          </Text>
        </div>
        <div css={meterBarStyle}>
          <div css={meterFillStyle(intensity)} />
        </div>
        <div css={meterTicksStyle}>
          <Text typography="t7" color="#546E7A">0</Text>
          <Text typography="t7" color="#546E7A">50</Text>
          <Text typography="t7" color="#546E7A">100</Text>
        </div>
      </div>
    </div>
  );
}
