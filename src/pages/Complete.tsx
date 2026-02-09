/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Text, Button } from '@toss/tds-mobile';
import { recordCompletion } from '../stores/storage';
import {
  Mood,
  MissionMode,
  CompleteAction,
  COMPLETE_ACTIONS,
} from '../types';

const containerStyle = css`
  min-height: 100vh;
  background: #fff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
`;

const successIconStyle = css`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px auto 24px;
`;

const titleStyle = css`
  text-align: center;
  margin-bottom: 40px;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const actionListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

const actionItemStyle = (isSelected: boolean) => css`
  padding: 16px 20px;
  border-radius: 12px;
  border: 1.5px solid ${isSelected ? '#3182F6' : '#E5E8EB'};
  background: ${isSelected ? '#F2F7FF' : '#fff'};
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.98);
  }
`;

const actionIconStyle = css`
  font-size: 24px;
`;

const radioStyle = (isSelected: boolean) => css`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${isSelected ? '#3182F6' : '#E5E8EB'};
  background: ${isSelected ? '#3182F6' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  flex-shrink: 0;
`;

const ctaContainerStyle = css`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function CheckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#3182F6">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function InnerDot() {
  return (
    <div
      css={css`
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fff;
      `}
    />
  );
}

const ACTION_ICONS: Record<CompleteAction, string> = {
  water: '💧',
  window: '🪟',
  walk: '👟',
};

export default function Complete() {
  const navigate = useNavigate();
  const location = useLocation();
  const mood = (location.state?.mood as Mood) || 'anxiety';
  const mode = (location.state?.mode as MissionMode) || 'slow_tap';

  const [selectedAction, setSelectedAction] = useState<CompleteAction | null>(null);

  const handleSave = () => {
    // 완료 기록 저장
    recordCompletion(mood, mode);
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/session', {
      state: { mood, mode }
    });
  };

  const actions: CompleteAction[] = ['water', 'window', 'walk'];

  return (
    <div css={containerStyle}>
      <div css={successIconStyle}>
        <CheckIcon />
      </div>

      <div css={titleStyle}>
        <Text typography="t2" fontWeight="bold">
          좋아요, 여기까지 완료!
        </Text>
        <Text typography="t5" color="#6B7684" style={{ marginTop: 8 }}>
          60초 동안 잘 집중했어요
        </Text>
      </div>

      <div css={sectionStyle}>
        <Text typography="t5" fontWeight="medium" color="#333D4B">
          마무리 액션을 선택해보세요
        </Text>
        <Text typography="t7" color="#8B95A1" style={{ marginTop: 4 }}>
          선택하지 않아도 괜찮아요
        </Text>

        <div css={actionListStyle}>
          {actions.map(action => (
            <div
              key={action}
              css={actionItemStyle(selectedAction === action)}
              onClick={() => setSelectedAction(
                selectedAction === action ? null : action
              )}
            >
              <span css={actionIconStyle}>{ACTION_ICONS[action]}</span>
              <Text
                typography="t5"
                fontWeight={selectedAction === action ? 'bold' : 'medium'}
                color={selectedAction === action ? '#3182F6' : '#333D4B'}
              >
                {COMPLETE_ACTIONS[action]}
              </Text>
              <div css={radioStyle(selectedAction === action)}>
                {selectedAction === action && <InnerDot />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div css={ctaContainerStyle}>
        <Button
          display="block"
          size="xlarge"
          color="primary"
          onClick={handleSave}
        >
          완료 기록하기
        </Button>
        <Button
          display="block"
          size="xlarge"
          color="light"
          onClick={handleRetry}
        >
          한 번 더 하기
        </Button>
      </div>
    </div>
  );
}
