/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Text } from '@toss/tds-mobile';
import { Mood, MissionMode, MOOD_LABELS, MISSION_INFO } from '../types';
import SlowTapMission from '../components/missions/SlowTapMission';
import GroundingMission from '../components/missions/GroundingMission';
import HoldReleaseMission from '../components/missions/HoldReleaseMission';

const containerStyle = css`
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const headerStyle = css`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F0F0F0;
`;

const headerLeftStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const closeButtonStyle = css`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const contentStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#333D4B">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const mood = (location.state?.mood as Mood) || 'anxiety';
  const mode = (location.state?.mode as MissionMode) || 'slow_tap';

  const handleClose = () => {
    if (confirm('세션을 중단하시겠어요?')) {
      navigate('/');
    }
  };

  const handleComplete = () => {
    navigate('/complete', {
      state: { mood, mode }
    });
  };

  const renderMission = () => {
    switch (mode) {
      case 'slow_tap':
        return <SlowTapMission onComplete={handleComplete} />;
      case 'hold_release':
        return <HoldReleaseMission onComplete={handleComplete} />;
      case 'grounding_321':
        return <GroundingMission onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <div css={headerLeftStyle}>
          <Text typography="t6" color="#6B7684">
            {MOOD_LABELS[mood]}
          </Text>
          <Text typography="t6" color="#E5E8EB">|</Text>
          <Text typography="t6" fontWeight="medium" color="#333D4B">
            {MISSION_INFO[mode].label}
          </Text>
        </div>
        <div css={closeButtonStyle} onClick={handleClose}>
          <CloseIcon />
        </div>
      </div>

      <div css={contentStyle}>
        {renderMission()}
      </div>
    </div>
  );
}
