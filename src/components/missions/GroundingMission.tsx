/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';
import { haptic } from '../../utils/haptic';

/* ───────── 선택지 풀 ───────── */

const SEE_OPTIONS = [
  '시계', '창문', '모니터', '책', '컵',
  '손가락', '조명', '벽', '신발', '식물',
  '가방', '충전기', '의자', '문', '포스터',
];

const HEAR_OPTIONS = [
  '에어컨 소리', '키보드 소리', '새소리', '시계 소리', '바람 소리',
  '숨소리', '자동차 소리', '발소리', '음악', '선풍기 소리',
  '빗소리', '물 흐르는 소리',
];

const FEEL_OPTIONS = [
  '발바닥의 바닥', '손 위의 공기', '의자에 닿는 등', '옷의 감촉', '손의 온기',
  '머리카락', '입술의 감각', '심장 박동', '숨이 나가는 느낌',
];

/** 배열에서 랜덤 n개 추출 (셔플) */
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

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

/* ───────── 섹션별 배경색 ───────── */

const SECTION_COLORS: Record<string, string> = {
  see: 'rgba(135, 206, 250, 0.08)',
  hear: 'rgba(144, 238, 144, 0.08)',
  feel: 'rgba(255, 218, 185, 0.08)',
};

/* ───────── 스타일 ───────── */

const containerStyle = (bgColor: string) => css`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 24px 20px;
  background: ${bgColor};
  transition: background 0.8s ease;
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
  background: ${isCompleted ? '#3182F6' : isActive ? '#3182F6' : '#E5E8EB'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
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
  border: 1.5px solid ${isSelected ? '#3182F6' : isActive ? '#B8D4FF' : '#E5E8EB'};
  background: ${isSelected ? '#F2F7FF' : '#fff'};
  cursor: ${isActive && !isSelected ? 'pointer' : 'default'};
  transition: border-color 0.2s, background 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

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
  background: #3182F6;
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

const BURST_COLORS = ['#3182F6', '#FF6B6B', '#FFD93D', '#6BCB77', '#B8D4FF'];

function CelebrationBurst() {
  const dots = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80,
      size: 4 + Math.random() * 4,
      color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
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

const ENCOURAGE_MESSAGES = [
  '좋아요, 주변을 느끼고 있어요 🌿',
  '감각이 깨어나고 있어요',
  '지금 이 순간에 머물러 봐요',
  '잘하고 있어요, 계속 해봐요',
  '마음이 차분해지고 있어요 ✨',
  '하나씩 찾아가고 있어요',
  '집중하는 모습이 멋져요',
  '주변이 더 선명하게 느껴지나요?',
  '감각에 집중하면 마음이 편해져요',
  '지금 여기, 이 공간을 느껴봐요 🍃',
  '작은 것들이 보이기 시작해요',
  '당신은 안전한 곳에 있어요',
];

function getRandomEncourage(prevIndex: number): [string, number] {
  let idx: number;
  do { idx = Math.floor(Math.random() * ENCOURAGE_MESSAGES.length); } while (idx === prevIndex);
  return [ENCOURAGE_MESSAGES[idx], idx];
}

/* ───────── 타입 ───────── */

interface GroundingMissionProps {
  onComplete: () => void;
}

interface SectionData {
  id: string;
  title: string;
  icon: string;
  required: number;          // 선택해야 하는 개수
  options: string[];         // 표시할 선택지 (랜덤 추출된)
  selected: Set<string>;     // 선택된 것들
}

/* ───────── 메인 컴포넌트 ───────── */

export default function GroundingMission({ onComplete }: GroundingMissionProps) {
  // 최초 마운트 시 선택지 랜덤 생성 (리렌더링에도 유지)
  const [sections, setSections] = useState<SectionData[]>(() => [
    {
      id: 'see',
      title: '보이는 것 3개',
      icon: '👁️',
      required: 3,
      options: pickRandom(SEE_OPTIONS, 6),
      selected: new Set(),
    },
    {
      id: 'hear',
      title: '들리는 것 2개',
      icon: '👂',
      required: 2,
      options: pickRandom(HEAR_OPTIONS, 5),
      selected: new Set(),
    },
    {
      id: 'feel',
      title: '느껴지는 것 1개',
      icon: '✋',
      required: 1,
      options: pickRandom(FEEL_OPTIONS, 4),
      selected: new Set(),
    },
  ]);

  const [celebratingSections, setCelebratingSections] = useState<Set<string>>(new Set());
  const [animatingChip, setAnimatingChip] = useState<string | null>(null);
  const [encourageMsg, setEncourageMsg] = useState('');
  const prevActiveSectionRef = useRef<string | null>(null);
  const prevMsgIndexRef = useRef(-1);

  const totalRequired = 6; // 3 + 2 + 1
  const totalSelected = sections.reduce((acc, s) => acc + s.selected.size, 0);
  const progress = totalSelected / totalRequired;

  const getActiveSection = useCallback(() => {
    for (const section of sections) {
      if (section.selected.size < section.required) {
        return section.id;
      }
    }
    return null;
  }, [sections]);

  const activeSection = getActiveSection();

  // 섹션 전환 감지
  const sectionJustActivated = activeSection !== prevActiveSectionRef.current;
  useEffect(() => {
    prevActiveSectionRef.current = activeSection;
  }, [activeSection]);

  const handleSelect = (sectionId: string, option: string) => {
    haptic.tap();
    setAnimatingChip(`${sectionId}-${option}`);
    setTimeout(() => setAnimatingChip(null), 300);

    // 격려 메시지 업데이트
    const [msg, idx] = getRandomEncourage(prevMsgIndexRef.current);
    prevMsgIndexRef.current = idx;
    setEncourageMsg(msg);

    setSections(prev => {
      const updated = prev.map(section => {
        if (section.id !== sectionId) return section;
        // 이미 필요한 개수를 채웠으면 무시
        if (section.selected.size >= section.required) return section;
        // 이미 선택된 건 무시 (토글 해제 없음 — 집중 유도)
        if (section.selected.has(option)) return section;

        const nextSelected = new Set(section.selected);
        nextSelected.add(option);
        return { ...section, selected: nextSelected };
      });

      // 섹션 완료 체크
      const section = updated.find(s => s.id === sectionId);
      if (section && section.selected.size === section.required) {
        haptic.success();
        setCelebratingSections(prev => new Set(prev).add(sectionId));
        setTimeout(() => {
          setCelebratingSections(prev => {
            const next = new Set(prev);
            next.delete(sectionId);
            return next;
          });
        }, 700);
      }

      return updated;
    });
  };

  // 전체 완료 감지
  useEffect(() => {
    if (totalSelected >= totalRequired) {
      haptic.success();
      onComplete();
    }
  }, [totalSelected, onComplete]);

  const bgColor = activeSection ? (SECTION_COLORS[activeSection] || '#fff') : '#fff';

  return (
    <div css={containerStyle(bgColor)}>
      <div css={titleStyle}>
        {encourageMsg ? (
          <div key={encourageMsg} css={encourageTextAnim}>
            <Text typography="t4" fontWeight="medium" color="#3182F6">
              {encourageMsg}
            </Text>
          </div>
        ) : (
          <Text typography="t4" fontWeight="medium" color="#333D4B">
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
                color={isCompleted ? '#3182F6' : isActive ? '#333D4B' : '#8B95A1'}
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
                      color={isSelected ? '#3182F6' : isActive ? '#333D4B' : '#8B95A1'}
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
        <Text typography="t7" color="#6B7684" style={{ marginBottom: 8, display: 'block' }}>
          {totalSelected} / {totalRequired} 완료
        </Text>
        <ProgressBar progress={progress} size="normal" />
      </div>
    </div>
  );
}
