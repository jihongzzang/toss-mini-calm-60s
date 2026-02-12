/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useMemo } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';
import { GROUNDING_CONFIG } from '../../config/missionConfig';
import { useGroundingGame } from '../../hooks/useGroundingGame';
import { primary, primaryBorder, textPrimary, textSecondary, textMuted, border } from '../../styles/tokens';
import { interactiveTapArea } from '../../styles/mixins';

/* ───────── 키프레임 ───────── */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const checkDrawAnimation = keyframes`
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
`;

const dotBurst = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
`;

const chipPop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(0.92); }
  70% { transform: scale(1.04); }
  100% { transform: scale(1); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 0 12px 4px rgba(76, 175, 80, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
`;

/* ───────── 스타일 ───────── */

const containerStyle = (bgColor: string) => css`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 24px 20px;
  background: ${bgColor};
  transition: background 1.2s ease;
`;

const titleStyle = css`
  text-align: center;
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const sectionTitleStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
`;

const iconCircleStyle = (isActive: boolean, isCompleted: boolean) => css`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${isCompleted ? '#4CAF50' : isActive ? primary : border};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  ${isCompleted && `
    box-shadow: 0 0 8px 2px rgba(76, 175, 80, 0.3);
    animation: ${glowPulse} 2s ease-in-out;
  `}
`;

const chipGridStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

const chipStyle = (isSelected: boolean, isActive: boolean) => css`
  padding: 10px 16px;
  border-radius: 20px;
  border: 1.5px solid ${isSelected ? '#4CAF50' : isActive ? primaryBorder : border};
  background: ${isSelected ? '#F1F8E9' : '#fff'};
  cursor: ${isActive && !isSelected ? 'pointer' : 'default'};
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  ${interactiveTapArea}
  ${isSelected && `box-shadow: 0 1px 3px rgba(76, 175, 80, 0.15);`}

  ${isActive && !isSelected && `
    &:active {
      transform: scale(0.96);
    }
  `}
`;

const selectedCountStyle = css`
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${primary};
  min-width: 36px;
  text-align: center;
`;

const progressContainerStyle = css`
  margin-top: auto;
  padding-top: 24px;
`;

const burstContainerStyle = css`
  position: absolute;
  top: 50%;
  left: 14px;
  pointer-events: none;
`;

const burstDotStyle = css`
  position: absolute;
  border-radius: 50%;
  animation: ${dotBurst} 0.6s ease-out forwards;
`;

/* ───────── 서브 컴포넌트 ───────── */

function AnimatedCheckIcon({ isChecked }: { isChecked: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
      <path
        d="M4.83 12L9 16.17L19.59 5.59"
        css={css`
          stroke-dasharray: 24;
          stroke-dashoffset: ${isChecked ? 0 : 24};
          ${isChecked && `animation: ${checkDrawAnimation} 0.4s ease-out forwards;`}
        `}
      />
    </svg>
  );
}

function CelebrationBurst() {
  const dots = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80,
      size: 4 + Math.random() * 4,
      color: GROUNDING_CONFIG.burstColors[Math.floor(Math.random() * GROUNDING_CONFIG.burstColors.length)],
      delay: Math.random() * 0.15,
    }))
  , []);

  return (
    <div css={burstContainerStyle}>
      {dots.map(dot => (
        <div
          key={dot.id}
          css={burstDotStyle}
          style={{
            width: dot.size,
            height: dot.size,
            background: dot.color,
            '--dx': `${dot.dx}px`,
            '--dy': `${dot.dy}px`,
            animationDelay: `${dot.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ───────── 격려 메시지 ───────── */

const encourageTextAnim = css`
  animation: ${fadeInUp} 0.3s ease-out;
`;

/* ───────── 타입 ───────── */

interface GroundingMissionProps {
  onComplete: () => void;
  onSectionChange?: (section: string) => void;
}

/* ───────── 메인 컴포넌트 ───────── */

export default function GroundingMission({ onComplete, onSectionChange }: GroundingMissionProps) {
  const {
    sections,
    activeSection,
    sectionJustActivated,
    celebratingSections,
    animatingChip,
    encourageMsg,
    totalSelected,
    totalRequired,
    progress,
    handleSelect,
  } = useGroundingGame(onComplete, onSectionChange);

  const bgColor = activeSection ? (GROUNDING_CONFIG.sectionColors[activeSection] || '#fff') : '#fff';

  return (
    <div css={containerStyle(bgColor)}>
      <div css={titleStyle}>
        {encourageMsg ? (
          <div key={encourageMsg} css={encourageTextAnim}>
            <Text typography="t4" fontWeight="medium" color="#4CAF50">
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color={textPrimary}>
            주변을 느끼며 마음을 가라앉혀 봐요
          </Text>
        )}
      </div>

      {sections.map(section => {
        const isCompleted = section.selected.size >= section.required;
        const isActive = section.id === activeSection;
        const isCelebrating = celebratingSections.has(section.id);
        const justBecameActive = isActive && sectionJustActivated;

        return (
          <div key={section.id} css={sectionStyle}>
            <div css={sectionTitleStyle}>
              <div css={iconCircleStyle(isActive, isCompleted)}>
                {isCompleted ? (
                  <AnimatedCheckIcon isChecked={true} />
                ) : (
                  <Text typography="t7">{section.icon}</Text>
                )}
              </div>
              <Text
                typography="t5"
                fontWeight="bold"
                color={isCompleted ? '#4CAF50' : isActive ? textPrimary : textMuted}
              >
                {section.title}
              </Text>
              {/* 선택 카운트 뱃지 */}
              {isActive && (
                <div css={selectedCountStyle}>
                  <Text typography="t7" fontWeight="bold" color="#fff">
                    {section.selected.size}/{section.required}
                  </Text>
                </div>
              )}
              {isCelebrating && <CelebrationBurst />}
            </div>

            <div css={chipGridStyle}>
              {section.options.map((option, index) => {
                const isSelected = section.selected.has(option);
                const chipKey = `${section.id}-${option}`;
                const isAnimating = animatingChip === chipKey;

                return (
                  <div
                    key={option}
                    css={[
                      chipStyle(isSelected, isActive),
                      justBecameActive && css`
                        animation: ${slideInRight} 0.3s ease-out ${index * 0.06}s both;
                      `,
                      isAnimating && css`
                        animation: ${chipPop} 0.3s ease-out;
                      `,
                    ]}
                    onClick={() => {
                      if (isActive && !isSelected && section.selected.size < section.required) {
                        handleSelect(section.id, option);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-disabled={!isActive || isSelected}
                    aria-label={option}
                  >
                    <Text
                      typography="t6"
                      fontWeight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? '#2E7D32' : isActive ? textPrimary : textMuted}
                    >
                      {option}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div css={progressContainerStyle}>
        <Text typography="t7" color={textSecondary} style={{ marginBottom: 8, display: 'block' }}>
          {totalSelected} / {totalRequired} 완료
        </Text>
        <ProgressBar progress={progress} size="normal" />
      </div>
    </div>
  );
}
