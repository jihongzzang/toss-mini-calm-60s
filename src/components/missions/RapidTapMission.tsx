/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Text } from '@toss/tds-mobile';
import { haptic } from '../../utils/haptic';

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
  -webkit-tap-highlight-color: transparent;
  user-select: none;
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

/* ───────── 격려 메시지 ───────── */

const ENCOURAGE_MESSAGES = [
  '스트레스가 날아가고 있어요 💨',
  '그 에너지 좋아요!',
  '답답한 마음, 다 터뜨려요 💥',
  '멈추지 말아요!',
  '감정이 해방되고 있어요',
  '한 번 더! 한 번 더! ✊',
  '이 속도 최고예요',
  '마음껏 발산해요 🔥',
  '후련해지고 있어요',
  '당신의 에너지가 폭발 중! ⚡',
  '이 리듬 놓치지 마세요',
  '스트레스 바이바이 👋',
  '점점 가벼워지고 있어요',
  '마음의 응어리가 풀리고 있어요',
  '지금 이 순간을 느껴봐요 ✨',
];

function getRandomEncourage(prevIndex: number): [string, number] {
  let idx: number;
  do { idx = Math.floor(Math.random() * ENCOURAGE_MESSAGES.length); } while (idx === prevIndex);
  return [ENCOURAGE_MESSAGES[idx], idx];
}

function getComboMessage(tps: number): string {
  if (tps >= 8) return '미쳤다!!!🤯';
  if (tps >= 6) return '불타오르는중🔥';
  if (tps >= 4) return '대단해요!!';
  if (tps >= 2) return '좋아요!';
  return '';
}

/* ───────── 용암 균열 경로 ───────── */

const CRACK_PATHS = [
  'M110 50 Q105 80 115 110',
  'M90 60 Q95 90 85 120',
  'M130 55 Q120 85 130 115',
  'M100 70 Q92 100 100 130',
];

const ERUPTION_COLORS = ['#FFC107', '#FFEB3B', '#FF6D00', '#FF8A65', '#D32F2F'];

/* ───────── 타입 ───────── */

interface RapidTapMissionProps {
  onComplete: () => void;
  onIntensityChange?: (intensity: number) => void;
}

interface Ripple { id: number; }
interface FloatingNum { id: number; value: number; }

/* ───────── 메인 컴포넌트 ───────── */

export default function RapidTapMission({ onComplete, onIntensityChange }: RapidTapMissionProps) {
  const [count, setCount] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [floatingNums, setFloatingNums] = useState<FloatingNum[]>([]);
  const [tps, setTps] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [encourageMsg, setEncourageMsg] = useState('');
  const [showEruption, setShowEruption] = useState(false);

  const rippleIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const tapTimestamps = useRef<number[]>([]);
  const intensityDecayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleted = useRef(false);
  const prevMsgIndexRef = useRef(-1);
  const prevIntensityRef = useRef(0);

  // 화산재 파티클 데이터 (고정)
  const embers = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      duration: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 2,
      color: ERUPTION_COLORS[i % ERUPTION_COLORS.length],
    }))
  , []);

  // 폭발 파티클 각도 (고정)
  const eruptionAngles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (360 / 12) * i + Math.random() * 15,
      color: ERUPTION_COLORS[Math.floor(Math.random() * ERUPTION_COLORS.length)],
    }))
  , []);

  // intensity 변화 콜백
  useEffect(() => {
    if (Math.abs(intensity - prevIntensityRef.current) > 0.05) {
      prevIntensityRef.current = intensity;
      onIntensityChange?.(intensity);
    }
  }, [intensity, onIntensityChange]);

  // intensity 감쇠 (100ms마다 -0.008 → 초당 -0.08)
  if (!intensityDecayTimer.current) {
    intensityDecayTimer.current = setInterval(() => {
      setIntensity(prev => Math.max(0, prev - 0.008));
      const now = Date.now();
      tapTimestamps.current = tapTimestamps.current.filter(t => now - t < 1000);
      setTps(tapTimestamps.current.length);
    }, 100);
  }

  const handleTap = useCallback(() => {
    if (isCompleted.current) return;

    const currentIntensity = intensity;
    if (currentIntensity > 0.7) {
      haptic.heavy();
    } else if (currentIntensity > 0.5) {
      haptic.medium();
    } else {
      haptic.tap();
    }

    const now = Date.now();
    tapTimestamps.current.push(now);

    setCount(prev => {
      const next = prev + 1;
      if (next % 50 === 0) haptic.success();
      if (next % 10 === 0) {
        const [msg, idx] = getRandomEncourage(prevMsgIndexRef.current);
        prevMsgIndexRef.current = idx;
        setEncourageMsg(msg);
      }
      return next;
    });

    setIntensity(prev => {
      const next = Math.min(1, prev + 0.06);
      // 폭발 이펙트 트리거
      if (next > 0.85 && prev <= 0.85) {
        setShowEruption(true);
        setTimeout(() => setShowEruption(false), 800);
      }
      return next;
    });

    // 리플 이펙트
    const rippleId = rippleIdRef.current++;
    setRipples(prev => [...prev, { id: rippleId }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 400);

    // 플로팅 숫자
    const currentCount = tapTimestamps.current.filter(t => now - t < 1000).length;
    if (currentCount >= 3) {
      const floatId = floatIdRef.current++;
      setFloatingNums(prev => [...prev, { id: floatId, value: currentCount }]);
      setTimeout(() => {
        setFloatingNums(prev => prev.filter(f => f.id !== floatId));
      }, 600);
    }
  }, [intensity]);

  void onComplete;

  const comboMessage = getComboMessage(tps);

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
            {CRACK_PATHS.map((path, i) => (
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
