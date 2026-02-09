/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text, Button } from '@toss/tds-mobile';
import { loadData } from '../stores/storage';
import {
  Mood,
  MOOD_LABELS,
  MOOD_RECOMMENDED_MISSION,
  MISSION_INFO
} from '../types';

const containerStyle = css`
  padding: 24px 20px;
  min-height: 100vh;
  background: #fff;
`;

const titleStyle = css`
  margin-bottom: 32px;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const moodGridStyle = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
`;

const moodButtonStyle = (isSelected: boolean) => css`
  padding: 16px 12px;
  border-radius: 12px;
  border: 1.5px solid ${isSelected ? '#3182F6' : '#E5E8EB'};
  background: ${isSelected ? '#F2F7FF' : '#fff'};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.97);
  }
`;

const recommendStyle = css`
  margin-top: 16px;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
`;

const statsStyle = css`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

const statItemStyle = css`
  flex: 1;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
  text-align: center;
`;

const ctaStyle = css`
  position: fixed;
  bottom: 76px;
  left: 20px;
  right: 20px;
`;

export default function Home() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = loadData();
    setTodayCount(data.todayCount);
    setStreak(data.streak);
  }, []);

  const handleStart = () => {
    if (!selectedMood) {
      alert('감정을 선택해 주세요');
      return;
    }
    navigate('/mode-select', {
      state: { mood: selectedMood }
    });
  };

  const recommendedMission = selectedMood
    ? MISSION_INFO[MOOD_RECOMMENDED_MISSION[selectedMood]]
    : null;

  const moods: Mood[] = ['anxiety', 'anger', 'lethargy', 'focus', 'tension', 'down'];

  return (
    <div css={containerStyle} className="page-container">
      <div css={titleStyle}>
        <Text typography="t2" fontWeight="bold">
          지금, 60초만 리셋
        </Text>
      </div>

      <div css={sectionStyle}>
        <Text typography="t5" fontWeight="medium" color="#6B7684">
          지금 기분이 어때요?
        </Text>
        <div css={moodGridStyle}>
          {moods.map((mood) => (
            <div
              key={mood}
              css={moodButtonStyle(selectedMood === mood)}
              onClick={() => setSelectedMood(mood)}
            >
              <Text
                typography="t6"
                fontWeight={selectedMood === mood ? 'bold' : 'medium'}
                color={selectedMood === mood ? '#3182F6' : '#333D4B'}
              >
                {MOOD_LABELS[mood]}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {recommendedMission && (
        <div css={recommendStyle}>
          <Text typography="t7" color="#6B7684">
            추천 모드
          </Text>
          <Text typography="t5" fontWeight="bold" style={{ marginTop: 4 }}>
            {recommendedMission.label}
          </Text>
        </div>
      )}

      <div css={sectionStyle}>
        <Text typography="t5" fontWeight="medium" color="#6B7684">
          오늘 통계
        </Text>
        <div css={statsStyle}>
          <div css={statItemStyle}>
            <Text typography="t3" fontWeight="bold" color="#3182F6">
              {todayCount}회
            </Text>
            <Text typography="t7" color="#8B95A1" style={{ marginTop: 4 }}>
              오늘 완료
            </Text>
          </div>
          <div css={statItemStyle}>
            <Text typography="t3" fontWeight="bold" color="#3182F6">
              {streak}일
            </Text>
            <Text typography="t7" color="#8B95A1" style={{ marginTop: 4 }}>
              연속
            </Text>
          </div>
        </div>
      </div>

      <div css={ctaStyle}>
        <Button
          display="block"
          size="xlarge"
          color="primary"
          onClick={handleStart}
        >
          시작
        </Button>
      </div>
    </div>
  );
}
