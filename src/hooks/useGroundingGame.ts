import { useState, useEffect, useRef, useCallback } from 'react';
import { GROUNDING_CONFIG } from '../config/missionConfig';
import { GROUNDING_MESSAGES, getRandomMessage } from '../config/messages';
import { pickRandom } from '../utils/pickRandom';
import { haptic } from '../utils/haptic';

export interface SectionData {
  id: string;
  title: string;
  icon: string;
  required: number;
  options: string[];
  selected: Set<string>;
}

export function useGroundingGame(onComplete: () => void, onSectionChange?: (section: string) => void) {
  // 최초 마운트 시 선택지 랜덤 생성 (리렌더링에도 유지)
  const [sections, setSections] = useState<SectionData[]>(() => [
    {
      id: 'see',
      title: `보이는 것 ${GROUNDING_CONFIG.seeCount}개`,
      icon: '👁️',
      required: GROUNDING_CONFIG.seeCount,
      options: pickRandom(GROUNDING_CONFIG.seeOptions, 6),
      selected: new Set(),
    },
    {
      id: 'hear',
      title: `들리는 것 ${GROUNDING_CONFIG.hearCount}개`,
      icon: '👂',
      required: GROUNDING_CONFIG.hearCount,
      options: pickRandom(GROUNDING_CONFIG.hearOptions, 5),
      selected: new Set(),
    },
    {
      id: 'feel',
      title: `느껴지는 것 ${GROUNDING_CONFIG.feelCount}개`,
      icon: '✋',
      required: GROUNDING_CONFIG.feelCount,
      options: pickRandom(GROUNDING_CONFIG.feelOptions, 4),
      selected: new Set(),
    },
  ]);

  const [celebratingSections, setCelebratingSections] = useState<Set<string>>(new Set());
  const [animatingChip, setAnimatingChip] = useState<string | null>(null);
  const [encourageMsg, setEncourageMsg] = useState('');
  const prevActiveSectionRef = useRef<string | null>(null);
  const prevMsgIndexRef = useRef(-1);

  const totalRequired = GROUNDING_CONFIG.totalRequired;
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
    if (activeSection && activeSection !== prevActiveSectionRef.current) {
      onSectionChange?.(activeSection);
    }
    prevActiveSectionRef.current = activeSection;
  }, [activeSection, onSectionChange]);

  const handleSelect = (sectionId: string, option: string) => {
    haptic.tap();
    setAnimatingChip(`${sectionId}-${option}`);
    setTimeout(() => setAnimatingChip(null), 300);

    // 격려 메시지 업데이트
    const [msg, idx] = getRandomMessage(GROUNDING_MESSAGES, prevMsgIndexRef.current);
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
  }, [totalSelected, totalRequired, onComplete]);

  return {
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
  };
}
