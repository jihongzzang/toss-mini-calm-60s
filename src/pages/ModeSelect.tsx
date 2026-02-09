/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Text, Button } from '@toss/tds-mobile';
import {
  Mood,
  MissionMode,
  MOOD_LABELS,
  MISSION_INFO,
  MOOD_RECOMMENDED_MISSION,
} from '../types';

const containerStyle = css`
  padding: 24px 20px;
  min-height: 100vh;
  background: #fff;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`;

const backButtonStyle = css`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 8px;
  -webkit-tap-highlight-color: transparent;
`;

const titleStyle = css`
  margin-bottom: 24px;
`;

const missionListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const missionCardStyle = (isSelected: boolean, isRecommended: boolean) => css`
  padding: 20px;
  border-radius: 16px;
  border: 2px solid ${isSelected ? '#3182F6' : '#E5E8EB'};
  background: ${isSelected ? '#F2F7FF' : '#fff'};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  -webkit-tap-highlight-color: transparent;

  ${isRecommended && !isSelected && `
    border-color: #B8D4FF;
    background: #FAFCFF;
  `}

  &:active {
    transform: scale(0.98);
  }
`;

const recommendBadgeStyle = css`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: #3182F6;
  border-radius: 6px;
`;

const missionLabelStyle = css`
  margin-bottom: 8px;
`;

const ctaStyle = css`
  position: fixed;
  bottom: 24px;
  left: 20px;
  right: 20px;
`;

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#333D4B">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

export default function ModeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const mood = (location.state?.mood as Mood) || 'anxiety';
  const recommendedMode = MOOD_RECOMMENDED_MISSION[mood];

  const [selectedMode, setSelectedMode] = useState<MissionMode>(recommendedMode);

  const handleStart = () => {
    navigate('/session', {
      state: { mood, mode: selectedMode }
    });
  };

  const modes: MissionMode[] = ['slow_tap', 'hold_release', 'grounding_321'];

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <div css={backButtonStyle} onClick={() => navigate(-1)}>
          <BackIcon />
        </div>
        <Text typography="t6" color="#6B7684">
          {MOOD_LABELS[mood]}
        </Text>
      </div>

      <div css={titleStyle}>
        <Text typography="t2" fontWeight="bold">
          어떤 방식으로 리셋할까요?
        </Text>
      </div>

      <div css={missionListStyle}>
        {modes.map((mode) => {
          const info = MISSION_INFO[mode];
          const isSelected = selectedMode === mode;
          const isRecommended = mode === recommendedMode;

          return (
            <div
              key={mode}
              css={missionCardStyle(isSelected, isRecommended)}
              onClick={() => setSelectedMode(mode)}
            >
              {isRecommended && (
                <div css={recommendBadgeStyle}>
                  <Text typography="t7" fontWeight="bold" color="#fff">
                    추천
                  </Text>
                </div>
              )}
              <div css={missionLabelStyle}>
                <Text
                  typography="t4"
                  fontWeight="bold"
                  color={isSelected ? '#3182F6' : '#333D4B'}
                >
                  {info.label}
                </Text>
              </div>
              <Text typography="t6" color="#6B7684">
                {info.description}
              </Text>
            </div>
          );
        })}
      </div>

      <div css={ctaStyle}>
        <Button
          display="block"
          size="xlarge"
          color="primary"
          onClick={handleStart}
        >
          시작하기
        </Button>
      </div>
    </div>
  );
}
