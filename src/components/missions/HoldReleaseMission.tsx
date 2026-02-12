/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { Text, ProgressBar } from '@toss/tds-mobile';
import { HOLD_RELEASE_CONFIG } from '../../config/missionConfig';
import { useHoldReleaseGame, type Phase } from '../../hooks/useHoldReleaseGame';
import { textPrimary, textMuted } from '../../styles/tokens';
import { interactiveTapArea } from '../../styles/mixins';

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
  ${interactiveTapArea}
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

/* ───────── 컬러 (config) ───────── */

const { flowerColors, leafGreen, stemGreen, targetCount } = HOLD_RELEASE_CONFIG;

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
  phase: Phase;
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
  const flowerColor = flowerColors[count % flowerColors.length];

  return (
    <svg width="180" height="220" viewBox="0 0 180 220">
      {/* 화분 */}
      <rect x="55" y="178" width="70" height="7" rx="3" fill="#8D6E63" />
      <path d="M61 185 L66 212 L114 212 L119 185 Z" fill="#795548" />
      <ellipse cx="90" cy="185" rx="29" ry="4" fill="#5D4037" />

      {/* 줄기 */}
      <line
        x1="90" y1="180" x2="90" y2={180 - stemLength}
        stroke={stemGreen}
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
          fill={leafGreen}
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
          fill={leafGreen}
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
        <line x1="10" y1="28" x2="10" y2="12" stroke={stemGreen} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 16 Q5 12 7 9" stroke={leafGreen} strokeWidth="1" fill="none" />
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

/* ───────── 메인 컴포넌트 ───────── */

export default function HoldReleaseMission({ onComplete }: HoldReleaseMissionProps) {
  const {
    count, phase, holdProgress, animateCount,
    encourageMsg, showBloomed, progress, flowerScale, breathScale,
    guideText,
    handlePressStart, handlePressEnd,
  } = useHoldReleaseGame(onComplete);

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
          <Text typography="t5" fontWeight="medium" color={phase === 'holding' ? '#4CAF50' : phase === 'releasing' ? '#F48FB1' : textPrimary}>
            {guideText}
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
          aria-label={`꾹 누르기 ${count}/${targetCount}`}
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
              <Text typography="t2" fontWeight="bold" color={phase === 'holding' ? '#4CAF50' : textPrimary}>
                {count}
              </Text>
            </div>
            <Text typography="t7" color={textMuted}>
              / {targetCount}
            </Text>
          </div>
        </div>

        {/* 상태 행: 위상 아이콘 + 남은 횟수 */}
        <div css={statusRowStyle}>
          <span css={phaseIconStyle(phase === 'ready', false)}>🌰</span>
          <span css={phaseIconStyle(phase === 'holding', phase === 'releasing')}>🌱</span>
          <span css={phaseIconStyle(phase === 'releasing', false)}>🌸</span>
          <Text typography="t6" color={textMuted}>
            {targetCount - count}회 남음
          </Text>
        </div>
      </div>

      {/* 하단: 갤러리 + 프로그레스 */}
      <div css={bottomAreaStyle}>
        {count > 0 && (
          <div css={gardenStyle}>
            {Array.from({ length: count }, (_, i) => (
              <MiniFlower key={i} color={flowerColors[i % flowerColors.length]} delay={0} />
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
