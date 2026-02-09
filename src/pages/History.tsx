/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { Text } from '@toss/tds-mobile';
import { loadData, getLast7DaysHistory } from '../stores/storage';
import { MOOD_LABELS, MISSION_INFO, Mood, MissionMode, SaveData } from '../types';

const containerStyle = css`
  padding: 24px 20px 100px;
  min-height: 100vh;
  background: #fff;
`;

const titleStyle = css`
  margin-bottom: 24px;
`;

const streakCardStyle = css`
  background: linear-gradient(135deg, #3182F6 0%, #1A6DD9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: #fff;
`;

const streakNumberStyle = css`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const sectionTitleStyle = css`
  margin-bottom: 16px;
`;

const calendarStyle = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const dayLabelStyle = css`
  text-align: center;
  padding: 8px 0;
`;

const dayItemStyle = (hasRecord: boolean, isToday: boolean) => css`
  aspect-ratio: 1;
  border-radius: 12px;
  background: ${hasRecord ? '#3182F6' : '#F8F9FA'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: ${isToday ? '2px solid #3182F6' : 'none'};
`;

const statsGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const statCardStyle = css`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 16px;
`;

const statItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #E5E8EB;
  }
`;

const emptyStateStyle = css`
  text-align: center;
  padding: 40px 20px;
  background: #F8F9FA;
  border-radius: 16px;
`;

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function History() {
  const [data, setData] = useState<SaveData | null>(null);
  const [history, setHistory] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    setData(loadData());
    setHistory(getLast7DaysHistory());
  }, []);

  if (!data) {
    return null;
  }

  const totalCount = Object.values(data.moodStats).reduce((a, b) => a + b, 0);
  const hasAnyRecord = totalCount > 0;

  // 감정 통계 정렬 (많은 순)
  const sortedMoodStats = Object.entries(data.moodStats)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  // 모드 통계 정렬 (많은 순)
  const sortedModeStats = Object.entries(data.modeStats)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div css={containerStyle} className="page-container">
      <div css={titleStyle}>
        <Text typography="t2" fontWeight="bold">
          기록
        </Text>
      </div>

      {/* 연속 streak 카드 */}
      <div css={streakCardStyle}>
        <Text typography="t5" style={{ opacity: 0.9 }}>
          연속 리셋
        </Text>
        <div css={streakNumberStyle}>
          <Text typography="t1" fontWeight="bold">
            {data.streak}
          </Text>
          <Text typography="t4" fontWeight="medium">
            일
          </Text>
        </div>
      </div>

      {/* 최근 7일 */}
      <div css={sectionStyle}>
        <div css={sectionTitleStyle}>
          <Text typography="t5" fontWeight="bold">
            최근 7일
          </Text>
        </div>

        <div css={calendarStyle}>
          {history.map((item) => {
            const date = new Date(item.date);
            const dayOfWeek = date.getDay();
            const dayNum = date.getDate();
            const isToday = item.date === today;

            return (
              <div key={item.date}>
                <div css={dayLabelStyle}>
                  <Text typography="t7" color="#8B95A1">
                    {DAY_LABELS[dayOfWeek]}
                  </Text>
                </div>
                <div css={dayItemStyle(item.count > 0, isToday)}>
                  <Text
                    typography="t6"
                    fontWeight="bold"
                    color={item.count > 0 ? '#fff' : '#333D4B'}
                  >
                    {dayNum}
                  </Text>
                  {item.count > 0 && (
                    <Text typography="t7" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {item.count}회
                    </Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 통계 */}
      {hasAnyRecord ? (
        <div css={statsGridStyle}>
          {/* 감정별 통계 */}
          <div css={statCardStyle}>
            <Text typography="t6" fontWeight="bold" color="#333D4B" style={{ marginBottom: 12 }}>
              감정별
            </Text>
            {sortedMoodStats.length > 0 ? (
              sortedMoodStats.slice(0, 4).map(([mood, count]) => (
                <div key={mood} css={statItemStyle}>
                  <Text typography="t7" color="#6B7684">
                    {MOOD_LABELS[mood as Mood]}
                  </Text>
                  <Text typography="t6" fontWeight="bold" color="#3182F6">
                    {count}회
                  </Text>
                </div>
              ))
            ) : (
              <Text typography="t7" color="#8B95A1">
                아직 기록이 없어요
              </Text>
            )}
          </div>

          {/* 모드별 통계 */}
          <div css={statCardStyle}>
            <Text typography="t6" fontWeight="bold" color="#333D4B" style={{ marginBottom: 12 }}>
              모드별
            </Text>
            {sortedModeStats.length > 0 ? (
              sortedModeStats.map(([mode, count]) => (
                <div key={mode} css={statItemStyle}>
                  <Text typography="t7" color="#6B7684">
                    {MISSION_INFO[mode as MissionMode].label}
                  </Text>
                  <Text typography="t6" fontWeight="bold" color="#3182F6">
                    {count}회
                  </Text>
                </div>
              ))
            ) : (
              <Text typography="t7" color="#8B95A1">
                아직 기록이 없어요
              </Text>
            )}
          </div>
        </div>
      ) : (
        <div css={emptyStateStyle}>
          <Text typography="t4" fontWeight="bold" color="#333D4B">
            아직 기록이 없어요
          </Text>
          <Text typography="t6" color="#8B95A1" style={{ marginTop: 8 }}>
            첫 번째 60초 리셋을 시작해보세요!
          </Text>
        </div>
      )}
    </div>
  );
}
