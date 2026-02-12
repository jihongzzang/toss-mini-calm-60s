/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';
import { haptic } from '../../utils/haptic';

/* ───────── 키프레임 ───────── */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const leafSway = keyframes`
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(3deg); }
`;

const miniPlantAppear = keyframes`
  0% { transform: scale(0) translateY(10px); opacity: 0; }
  60% { transform: scale(1.2) translateY(-2px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
`;

const countBounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

/* ───────── 스타일 ───────── */

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 16px 20px;
  background: linear-gradient(180deg, #FFFFFF 0%, #E8F5E9 100%);
  overflow: hidden;
`;

const guideStyle = css`
  margin-bottom: 12px;
  text-align: center;
  min-height: 28px;
  flex-shrink: 0;
`;

const encourageTextAnim = css`
  animation: ${fadeInUp} 0.3s ease-out;
`;

/* 식물 + 카운트를 감싸는 중앙 영역 */
const centerAreaStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
`;

const plantContainerStyle = (scale: number) => css`
  position: relative;
  width: 180px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transform: scale(${scale});
  transition: transform 0.1s linear;
  flex-shrink: 0;
`;

const countOverlayStyle = css`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
`;

const countAnimStyle = (animate: boolean) => css`
  ${animate && `animation: ${countBounce} 0.3s ease-out;`}
`;

/* 위상 표시 + 남은 횟수 한 줄 */
const statusRowStyle = css`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  flex-shrink: 0;
`;

const phaseIconStyle = (isActive: boolean, isCompleted: boolean) => css`
  font-size: ${isActive ? 18 : 14}px;
  opacity: ${isCompleted ? 1 : isActive ? 0.9 : 0.4};
  transition: all 0.3s ease;
`;

/* 하단 영역: 갤러리 + 프로그레스 */
const bottomAreaStyle = css`
  width: 100%;
  flex-shrink: 0;
  margin-top: 12px;
`;

const gardenStyle = css`
  display: flex;
  gap: 4px;
  justify-content: center;
  min-height: 28px;
  align-items: flex-end;
  margin-bottom: 8px;
`;

const miniPlantStyle = (delay: number) => css`
  animation: ${miniPlantAppear} 0.5s ease-out ${delay}s both;
`;

const progressContainerStyle = css`
  width: 100%;
`;

/* ───────── 격려 메시지 ───────── */

const ENCOURAGE_MESSAGES = [
  '새싹이 자라고 있어요 🌱',
  '잘하고 있어요, 이 느낌 그대로',
  '몸이 이완되고 있어요',
  '마음이 한결 가벼워지고 있어요',
  '숨이 편안해지고 있어요 ✨',
  '긴장이 녹고 있어요',
  '깊은 고요함이 찾아와요',
  '한 걸음 더 성장하고 있어요',
  '내 안의 평화를 느껴봐요',
  '좋은 리듬이에요 🌿',
  '마음의 짐을 내려놓는 중이에요',
  '이 순간에만 집중해 봐요',
  '당신의 시간이에요 🍃',
  '천천히, 자연스럽게',
  '꽃이 피어나고 있어요 🌸',
];

function getRandomMessage(prevIndex: number): [string, number] {
  let idx: number;
  do { idx = Math.floor(Math.random() * ENCOURAGE_MESSAGES.length); } while (idx === prevIndex);
  return [ENCOURAGE_MESSAGES[idx], idx];
}

/* ───────── 컬러 ───────── */

const FLOWER_COLORS = ['#F48FB1', '#CE93D8', '#FFB74D', '#81C784', '#90CAF9', '#FFAB91', '#80DEEA', '#A5D6A7', '#EF9A9A', '#B39DDB'];
const LEAF_GREEN = '#66BB6A';
const STEM_GREEN = '#4CAF50';

/* ───────── 서브 컴포넌트 ───────── */

/** 메인 식물 SVG */
function PlantSVG({
  holdProgress,
  phase,
  count,
  showBloomed,
  flowerScale,
}: {
  holdProgress: number;
  phase: 'ready' | 'holding' | 'releasing';
  count: number;
  showBloomed: boolean;
  flowerScale: number;
}) {
  const stemLength = 100;
  const isGrowing = phase === 'holding' || phase === 'releasing' || showBloomed;
  const stemVisible = isGrowing ? stemLength * Math.min(holdProgress, 1) : 0;
  const showLeftLeaf = holdProgress > 0.4 && isGrowing;
  const showRightLeaf = holdProgress > 0.7 && isGrowing;
  const showFlower = phase === 'releasing' || showBloomed;
  const flowerColor = FLOWER_COLORS[count % FLOWER_COLORS.length];

  return (
    <svg width="180" height="220" viewBox="0 0 180 220">
      {/* 화분 */}
      <rect x="55" y="178" width="70" height="7" rx="3" fill="#8D6E63" />
      <path d="M61 185 L66 212 L114 212 L119 185 Z" fill="#795548" />
      <ellipse cx="90" cy="185" rx="29" ry="4" fill="#5D4037" />

      {/* 줄기 */}
      <line
        x1="90" y1="180" x2="90" y2={180 - stemLength}
        stroke={STEM_GREEN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={stemLength}
        strokeDashoffset={stemLength - stemVisible}
        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
      />

      {/* 왼쪽 잎 */}
      <g
        css={css`
          opacity: ${showLeftLeaf ? 1 : 0};
          transition: opacity 0.4s ease;
          animation: ${showLeftLeaf ? leafSway : 'none'} 3s ease-in-out infinite;
          transform-origin: 90px 140px;
        `}
      >
        <path
          d="M90 140 Q70 130 73 114 Q83 123 90 140"
          fill={LEAF_GREEN}
        />
      </g>

      {/* 오른쪽 잎 */}
      <g
        css={css`
          opacity: ${showRightLeaf ? 1 : 0};
          transition: opacity 0.4s ease;
          animation: ${showRightLeaf ? leafSway : 'none'} 3.5s ease-in-out 0.5s infinite;
          transform-origin: 90px 118px;
        `}
      >
        <path
          d="M90 118 Q110 108 107 92 Q97 100 90 118"
          fill={LEAF_GREEN}
          opacity="0.85"
        />
      </g>

      {/* 꽃 */}
      {showFlower && (
        <g
          style={{
            transformOrigin: '90px 80px',
            transform: `scale(${flowerScale})`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <ellipse
              key={i}
              cx="90"
              cy="68"
              rx="6"
              ry="12"
              fill={flowerColor}
              opacity={0.85}
              transform={`rotate(${angle} 90 80)`}
            />
          ))}
          <circle cx="90" cy="80" r="5" fill="#FFB74D" />
        </g>
      )}

      {/* 씨앗 (ready 상태) */}
      {phase === 'ready' && holdProgress === 0 && (
        <g>
          <ellipse cx="90" cy="178" rx="4" ry="3" fill="#795548" />
          <ellipse cx="90" cy="178" rx="2.5" ry="2" fill="#8D6E63" />
        </g>
      )}
    </svg>
  );
}

/** 미니 꽃 아이콘 */
function MiniFlower({ color, delay }: { color: string; delay: number }) {
  return (
    <div css={miniPlantStyle(delay)}>
      <svg width="20" height="28" viewBox="0 0 20 28">
        <line x1="10" y1="28" x2="10" y2="12" stroke={STEM_GREEN} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 16 Q5 12 7 9" stroke={LEAF_GREEN} strokeWidth="1" fill="none" />
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse
            key={i}
            cx="10"
            cy="8"
            rx="2.5"
            ry="5"
            fill={color}
            opacity="0.8"
            transform={`rotate(${angle} 10 10)`}
          />
        ))}
        <circle cx="10" cy="10" r="2" fill="#FFB74D" />
      </svg>
    </div>
  );
}

/* ───────── 타입 ───────── */

interface HoldReleaseMissionProps {
  onComplete: () => void;
}

const TARGET_COUNT = 10;
const HOLD_DURATION = 4000;
const RELEASE_DURATION = 2000;

type Phase = 'ready' | 'holding' | 'releasing';

/* ───────── 메인 컴포넌트 ───────── */

export default function HoldReleaseMission({ onComplete }: HoldReleaseMissionProps) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [holdProgress, setHoldProgress] = useState(0);
  const [releaseProgress, setReleaseProgress] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState('');
  const [showBloomed, setShowBloomed] = useState(false);

  const holdStartTime = useRef<number>(0);
  const releaseStartTime = useRef<number>(0);
  const animationFrame = useRef<number>(0);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bloomedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMsgIndexRef = useRef(-1);

  const progress = count / TARGET_COUNT;
  const flowerScale = showBloomed ? 1 : (phase === 'releasing' ? releaseProgress : 0);

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

      const [msg, idx] = getRandomMessage(prevMsgIndexRef.current);
      prevMsgIndexRef.current = idx;
      setEncourageMsg(msg);

      // 만개된 꽃을 800ms 동안 보여준 뒤 리셋
      setShowBloomed(true);
      bloomedTimeout.current = setTimeout(() => {
        setShowBloomed(false);
        setPhase('ready');
        setHoldProgress(0);
        setReleaseProgress(0);
      }, 800);
    } else {
      animationFrame.current = requestAnimationFrame(updateReleaseProgress);
    }
  }, []);

  const handlePressStart = useCallback(() => {
    if (phase !== 'ready' || showBloomed) return;

    setPhase('holding');
    holdStartTime.current = Date.now();
    haptic.medium();
    animationFrame.current = requestAnimationFrame(updateHoldProgress);

    hapticInterval.current = setInterval(() => {
      haptic.light();
    }, 500);
  }, [phase, showBloomed, updateHoldProgress]);

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
      if (bloomedTimeout.current) clearTimeout(bloomedTimeout.current);
    };
  }, []);

  const getGuideText = () => {
    switch (phase) {
      case 'ready': return '화분을 꾹 눌러봐요';
      case 'holding': return `새싹이 자라는 중... ${Math.ceil((HOLD_DURATION - holdProgress * HOLD_DURATION) / 1000)}초`;
      case 'releasing': return '꽃이 피어나요... 🌸';
    }
  };

  // 호흡 스케일
  const breathScale = phase === 'holding'
    ? 1 + 0.12 * holdProgress
    : phase === 'releasing'
    ? 1.12 - 0.12 * releaseProgress
    : 1;

  return (
    <div css={containerStyle}>
      {/* 가이드 */}
      <div css={guideStyle}>
        {phase === 'ready' && encourageMsg ? (
          <div key={encourageMsg} css={encourageTextAnim}>
            <Text typography="t5" fontWeight="medium" color="#4CAF50">
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t5" fontWeight="medium" color={phase === 'holding' ? '#4CAF50' : phase === 'releasing' ? '#F48FB1' : '#333D4B'}>
            {getGuideText()}
          </Text>
        )}
      </div>

      {/* 중앙 영역: 식물 + 상태 */}
      <div css={centerAreaStyle}>
        <div
          css={plantContainerStyle(breathScale)}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          role="button"
          aria-label={`꾹 누르기 ${count}/${TARGET_COUNT}`}
        >
          <PlantSVG
            holdProgress={holdProgress}
            phase={phase}
            count={count}
            showBloomed={showBloomed}
            flowerScale={flowerScale}
          />
          <div css={countOverlayStyle}>
            <div css={countAnimStyle(animateCount)}>
              <Text typography="t2" fontWeight="bold" color={phase === 'holding' ? '#4CAF50' : '#333D4B'}>
                {count}
              </Text>
            </div>
            <Text typography="t7" color="#8B95A1">
              / {TARGET_COUNT}
            </Text>
          </div>
        </div>

        {/* 상태 행: 위상 아이콘 + 남은 횟수 */}
        <div css={statusRowStyle}>
          <span css={phaseIconStyle(phase === 'ready', false)}>🌰</span>
          <span css={phaseIconStyle(phase === 'holding', phase === 'releasing')}>🌱</span>
          <span css={phaseIconStyle(phase === 'releasing', false)}>🌸</span>
          <Text typography="t6" color="#8B95A1">
            {TARGET_COUNT - count}회 남음
          </Text>
        </div>
      </div>

      {/* 하단: 갤러리 + 프로그레스 */}
      <div css={bottomAreaStyle}>
        {count > 0 && (
          <div css={gardenStyle}>
            {Array.from({ length: count }, (_, i) => (
              <MiniFlower key={i} color={FLOWER_COLORS[i % FLOWER_COLORS.length]} delay={0} />
            ))}
          </div>
        )}
        <div css={progressContainerStyle}>
          <ProgressBar progress={progress} size="normal" />
        </div>
      </div>
    </div>
  );
}
