/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { Text, ProgressBar } from '@toss/tds-mobile';

const containerStyle = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 24px 20px;
`;

const titleStyle = css`
  text-align: center;
  margin-bottom: 32px;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const sectionTitleStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const iconCircleStyle = (isActive: boolean, isCompleted: boolean) => css`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${isCompleted ? '#3182F6' : isActive ? '#3182F6' : '#E5E8EB'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const checklistStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const checkItemStyle = (isChecked: boolean, isActive: boolean) => css`
  padding: 16px;
  border-radius: 12px;
  border: 1.5px solid ${isChecked ? '#3182F6' : isActive ? '#B8D4FF' : '#E5E8EB'};
  background: ${isChecked ? '#F2F7FF' : '#fff'};
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: ${isActive && !isChecked ? 'pointer' : 'default'};
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;

  ${isActive && !isChecked && `
    &:active {
      transform: scale(0.98);
    }
  `}
`;

const checkCircleStyle = (isChecked: boolean) => css`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${isChecked ? '#3182F6' : '#E5E8EB'};
  background: ${isChecked ? '#3182F6' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const progressContainerStyle = css`
  margin-top: auto;
  padding-top: 24px;
`;

interface GroundingMissionProps {
  onComplete: () => void;
}

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  items: CheckItem[];
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

export default function GroundingMission({ onComplete }: GroundingMissionProps) {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'see',
      title: '보이는 것 3개',
      icon: '👁️',
      items: [
        { id: 'see1', label: '첫 번째 보이는 것', checked: false },
        { id: 'see2', label: '두 번째 보이는 것', checked: false },
        { id: 'see3', label: '세 번째 보이는 것', checked: false },
      ],
    },
    {
      id: 'hear',
      title: '들리는 것 2개',
      icon: '👂',
      items: [
        { id: 'hear1', label: '첫 번째 들리는 것', checked: false },
        { id: 'hear2', label: '두 번째 들리는 것', checked: false },
      ],
    },
    {
      id: 'feel',
      title: '느껴지는 것 1개',
      icon: '✋',
      items: [
        { id: 'feel1', label: '지금 느껴지는 것', checked: false },
      ],
    },
  ]);

  const totalItems = 6;
  const checkedCount = sections.reduce(
    (acc, section) => acc + section.items.filter(item => item.checked).length,
    0
  );
  const progress = (checkedCount / totalItems) * 100;

  // 현재 활성 섹션 찾기
  const getActiveSection = () => {
    for (const section of sections) {
      if (section.items.some(item => !item.checked)) {
        return section.id;
      }
    }
    return null;
  };

  const activeSection = getActiveSection();

  const handleCheck = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, checked: true } : item
          ),
        };
      })
    );
  };

  useEffect(() => {
    if (checkedCount >= totalItems) {
      onComplete();
    }
  }, [checkedCount, onComplete]);

  return (
    <div css={containerStyle}>
      <div css={titleStyle}>
        <Text typography="t4" fontWeight="medium" color="#333D4B">
          지금 이 순간에 집중하세요
        </Text>
      </div>

      {sections.map(section => {
        const sectionCompleted = section.items.every(item => item.checked);
        const isActive = section.id === activeSection;

        return (
          <div key={section.id} css={sectionStyle}>
            <div css={sectionTitleStyle}>
              <div css={iconCircleStyle(isActive, sectionCompleted)}>
                {sectionCompleted ? (
                  <CheckIcon />
                ) : (
                  <Text typography="t7">{section.icon}</Text>
                )}
              </div>
              <Text
                typography="t5"
                fontWeight="bold"
                color={sectionCompleted ? '#3182F6' : isActive ? '#333D4B' : '#8B95A1'}
              >
                {section.title}
              </Text>
            </div>

            <div css={checklistStyle}>
              {section.items.map(item => (
                <div
                  key={item.id}
                  css={checkItemStyle(item.checked, isActive)}
                  onClick={() => {
                    if (isActive && !item.checked) {
                      handleCheck(section.id, item.id);
                    }
                  }}
                >
                  <div css={checkCircleStyle(item.checked)}>
                    {item.checked && <CheckIcon />}
                  </div>
                  <Text
                    typography="t6"
                    color={item.checked ? '#3182F6' : isActive ? '#333D4B' : '#8B95A1'}
                  >
                    {item.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div css={progressContainerStyle}>
        <Text typography="t7" color="#6B7684" style={{ marginBottom: 8, display: 'block' }}>
          {checkedCount} / {totalItems} 완료
        </Text>
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}
