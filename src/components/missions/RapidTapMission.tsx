/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useRef, useCallback, useMemo } from 'react';
import { Text } from '@toss/tds-mobile';
import { haptic } from '../../utils/haptic';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const guideStyle = css`
  margin-bottom: 24px;
  text-align: center;
  z-index: 2;
`;

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

const tapZoneStyle = (intensity: number) => css`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: ${getIntensityColor(intensity)};
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
  ${intensity > 0.5 ? `animation: ${shakeAnimation} 0.3s ease-in-out infinite;` : ''}

  &:active {
    transform: scale(0.96);
  }
`;

const rippleStyle = css`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.5);
  animation: ${impactRipple} 0.4s ease-out forwards;
  pointer-events: none;
`;

const floatingNumberStyle = css`
  position: absolute;
  pointer-events: none;
  font-weight: bold;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(0, 0, 0, 0.03);
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
  background: #E5E8EB;
  overflow: hidden;
`;

const meterFillStyle = (intensity: number) => css`
  height: 100%;
  width: ${intensity * 100}%;
  background: ${getIntensityColor(intensity)};
  border-radius: 7px;
  transition: width 0.15s, background 0.15s;
  ${intensity > 0.6 ? `box-shadow: 0 0 12px ${getIntensityColor(intensity)}80;` : ''}
`;

const meterTicksStyle = css`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  padding: 0 2px;
`;

const bgParticleStyle = (x: number, y: number, size: number, color: string) => css`
  position: absolute;
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
  background: ${color};
  left: ${x}%;
  top: ${y}%;
  opacity: 0.15;
  pointer-events: none;
  transition: opacity 0.3s;
`;

interface RapidTapMissionProps {
  onComplete: () => void;
}

interface Ripple {
  id: number;
}

interface FloatingNum {
  id: number;
  value: number;
}

function getIntensityColor(intensity: number): string {
  if (intensity < 0.3) return '#3182F6';
  if (intensity < 0.6) return '#7B61FF';
  if (intensity < 0.8) return '#FF6B6B';
  return '#FF3B3B';
}

function getComboMessage(tps: number): string {
  if (tps >= 8) return '미쳤다!!!🤯';
  if (tps >= 6) return '불타오르는중🔥';
  if (tps >= 4) return '대단해요!!';
  if (tps >= 2) return '좋아요!';
  return '';
}

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

const encourageMsgAnimStyle = css`
  animation: ${fadeIn} 0.2s ease-out;
`;

export default function RapidTapMission({ onComplete }: RapidTapMissionProps) {
  const [count, setCount] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [floatingNums, setFloatingNums] = useState<FloatingNum[]>([]);
  const [tps, setTps] = useState(0); // taps per second
  const [intensity, setIntensity] = useState(0);
  const [encourageMsg, setEncourageMsg] = useState('');

  const rippleIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const tapTimestamps = useRef<number[]>([]);
  const intensityDecayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleted = useRef(false);
  const prevMsgIndexRef = useRef(-1);

  // 배경 장식 파티클 (고정)
  const bgParticles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 20 + Math.random() * 40,
      color: ['#3182F6', '#7B61FF', '#FF6B6B', '#FFD93D'][i % 4],
    }))
  , []);

  // intensity 감쇠 시작
  if (!intensityDecayTimer.current) {
    intensityDecayTimer.current = setInterval(() => {
      setIntensity(prev => Math.max(0, prev - 0.02));
      // TPS 업데이트
      const now = Date.now();
      tapTimestamps.current = tapTimestamps.current.filter(t => now - t < 1000);
      setTps(tapTimestamps.current.length);
    }, 50);
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

    // 카운트 증가
    setCount(prev => {
      const next = prev + 1;
      // 목표 없이 60초 타이머에 의존하지만, 엄청난 탭 수에 대한 축하
      if (next % 50 === 0) {
        haptic.success();
      }
      // 10탭마다 격려 메시지
      if (next % 10 === 0) {
        const [msg, idx] = getRandomEncourage(prevMsgIndexRef.current);
        prevMsgIndexRef.current = idx;
        setEncourageMsg(msg);
      }
      return next;
    });

    // intensity 증가
    setIntensity(prev => Math.min(1, prev + 0.05));

    // 리플 이펙트
    const rippleId = rippleIdRef.current++;
    setRipples(prev => [...prev, { id: rippleId }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 400);

    // 플로팅 숫자 (5탭마다)
    const currentCount = tapTimestamps.current.filter(t => now - t < 1000).length;
    if (currentCount >= 3) {
      const floatId = floatIdRef.current++;
      setFloatingNums(prev => [...prev, { id: floatId, value: currentCount }]);
      setTimeout(() => {
        setFloatingNums(prev => prev.filter(f => f.id !== floatId));
      }, 600);
    }
  }, []);

  // onComplete은 Session의 타이머가 처리하므로 여기서는 별도로 호출하지 않음
  // 하지만 혹시 직접 호출이 필요할 경우를 위해 prop은 유지
  void onComplete;

  const comboMessage = getComboMessage(tps);

  return (
    <div css={containerStyle}>
      {/* 배경 파티클 */}
      {bgParticles.map(p => (
        <div
          key={p.id}
          css={[
            bgParticleStyle(p.x, p.y, p.size, p.color),
            intensity > 0.3 && css`opacity: ${0.1 + intensity * 0.2};`,
          ]}
        />
      ))}

      <div css={guideStyle}>
        {encourageMsg ? (
          <div key={encourageMsg} css={encourageMsgAnimStyle}>
            <Text typography="t4" fontWeight="medium" color="#3182F6">
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color="#333D4B">
            마음껏 두드려요!
          </Text>
        )}
      </div>

      <div css={tapZoneStyle(intensity)} onClick={handleTap} role="button" aria-label={`빠르게 터치 ${count}탭`}>
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
        <Text typography="t6" color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>
          탭
        </Text>
      </div>

      <div css={countStyle}>
        <Text typography="t5" color="#6B7684">
          {tps > 0 ? `${tps}회/초` : '터치를 시작해요'}
        </Text>
      </div>

      <div css={comboStyle}>
        {comboMessage && (
          <div css={comboTextStyle}>
            <Text typography="t4" fontWeight="bold" color={getIntensityColor(intensity)}>
              {comboMessage}
            </Text>
          </div>
        )}
      </div>

      <div css={meterContainerStyle}>
        <div css={meterLabelRowStyle}>
          <Text typography="t6" fontWeight="bold" color="#333D4B">
            🔥 강도
          </Text>
          <Text typography="t6" fontWeight="bold" color={getIntensityColor(intensity)}>
            {Math.round(intensity * 100)}%
          </Text>
        </div>
        <div css={meterBarStyle}>
          <div css={meterFillStyle(intensity)} />
        </div>
        <div css={meterTicksStyle}>
          <Text typography="t7" color="#8B95A1">0</Text>
          <Text typography="t7" color="#8B95A1">50</Text>
          <Text typography="t7" color="#8B95A1">100</Text>
        </div>
      </div>
    </div>
  );
}
