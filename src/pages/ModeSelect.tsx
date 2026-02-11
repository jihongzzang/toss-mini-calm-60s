/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Text, Button, Asset } from '@toss/tds-mobile';
import { haptic } from '../utils/haptic';
import {
  Mood,
  MissionMode,
  MOOD_LABELS,
  MISSION_INFO,
  MOOD_RECOMMENDED_MISSION,
} from '../types';

const fadeSlideIn = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

/* bounceSelect는 transform transition으로 대체 — animation 충돌 방지 */

const badgePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const containerStyle = css`
  padding: 24px 20px;
  min-height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
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
  animation: ${fadeSlideIn} 0.4s ease-out;
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
  transition: transform 0.2s ease-out, border-color 0.2s, background 0.2s;
  position: relative;
  -webkit-tap-highlight-color: transparent;

  ${isRecommended && !isSelected && `
    border-color: #B8D4FF;
    background: #FAFCFF;
  `}
`;

const recommendBadgeStyle = css`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: #3182F6;
  border-radius: 6px;
  animation: ${badgePulse} 2s ease-in-out infinite;
`;

const missionCardContentStyle = css`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const missionIconEmojiStyle = css`
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const missionTextStyle = css`
  flex: 1;
  min-width: 0;
`;

const missionLabelStyle = css`
  margin-bottom: 8px;
`;

const ctaStyle = css`
  margin-top: auto;
  padding-top: 24px;
  padding-bottom: 24px;
`;


export default function ModeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const mood = (location.state?.mood as Mood) || 'anxiety';
  const recommendedMode = MOOD_RECOMMENDED_MISSION[mood];

  const [selectedMode, setSelectedMode] = useState<MissionMode>(recommendedMode);
  const [animatingMode, setAnimatingMode] = useState<MissionMode | null>(null);

  const handleModeSelect = (mode: MissionMode) => {
    haptic.light();
    setSelectedMode(mode);
    setAnimatingMode(mode);
    setTimeout(() => setAnimatingMode(null), 300);
  };

  const handleStart = () => {
    haptic.medium();
    navigate('/session', {
      state: { mood, mode: selectedMode }
    });
  };

  const modes: MissionMode[] = ['slow_tap', 'hold_release', 'grounding_321', 'rapid_tap'];

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <div css={backButtonStyle} onClick={() => navigate(-1)} role="button" aria-label="뒤로 가기">
          <Asset.Icon
            name="icon-arrow-left-mono"
            color="#333D4B"
            frameShape={Asset.frameShape.CleanW24}
          />
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

      <div css={missionListStyle} role="radiogroup" aria-label="미션 모드 선택">
        {modes.map((mode, index) => {
          const info = MISSION_INFO[mode];
          const isSelected = selectedMode === mode;
          const isRecommended = mode === recommendedMode;

          return (
            <div
              key={mode}
              css={[
                missionCardStyle(isSelected, isRecommended),
                css`animation: ${fadeSlideIn} 0.4s ease-out ${0.1 + index * 0.1}s both;`,
                animatingMode === mode && css`transform: scale(0.97);`,
              ]}
              onClick={() => handleModeSelect(mode)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${info.label} - ${info.description}${isRecommended ? ' (추천)' : ''}`}
            >
              {isRecommended && (
                <div css={recommendBadgeStyle}>
                  <Text typography="t7" fontWeight="bold" color="#fff">
                    추천
                  </Text>
                </div>
              )}
              <div css={missionCardContentStyle}>
                <Asset.Frame
                  shape={Asset.frameShape.SquircleLarge}
                  backgroundColor={isSelected ? '#E8F3FF' : '#F2F4F6'}
                  content={<span css={missionIconEmojiStyle}>{info.icon}</span>}
                />
                <div css={missionTextStyle}>
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
              </div>
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
