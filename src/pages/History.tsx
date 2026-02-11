/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { useState, useEffect } from 'react';
import { Text, Asset } from '@toss/tds-mobile';
import { loadData, getLast7DaysHistory, getTotalCount } from '../stores/storage';
import { useCountUp } from '../hooks/useCountUp';
import {
  MOOD_LABELS,
  MOOD_ICONS,
  MISSION_INFO,
  Mood,
  MissionMode,
  SaveData,
} from '../types';

const fadeSlideIn = keyframes`
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const containerStyle = css`
  padding: 24px 20px;
  background: #fff;
`;

const titleStyle = css`
  margin-bottom: 24px;
  animation: ${fadeSlideIn} 0.4s ease-out;
`;

/* ───────── 스트릭 카드 ───────── */

const streakCardStyle = css`
  background: linear-gradient(135deg, #3182F6 0%, #1A6DD9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  color: #fff;
  animation: ${fadeSlideIn} 0.4s ease-out 0.1s both;
`;

const streakRow = css`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
`;

const streakMsgStyle = css`
  margin-top: 8px;
  opacity: 0.85;
`;

/* ───────── 요약 카드 ───────── */

const summaryRowStyle = css`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  animation: ${fadeSlideIn} 0.4s ease-out 0.15s both;
`;

const summaryCardStyle = css`
  flex: 1;
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

/* ───────── 최근 7일 ───────── */

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
  transition: background 0.3s ease;
`;

/* ───────── 통계 그리드 ───────── */

const statsGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const statCardStyle = css`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 16px;
`;

const statItemStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #E5E8EB;
  }
`;

const statLabelStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const emptyStateStyle = css`
  text-align: center;
  padding: 40px 20px;
  background: #F8F9FA;
  border-radius: 16px;
  animation: ${fadeSlideIn} 0.4s ease-out 0.2s both;
`;

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getStreakMessage(streak: number): string {
  if (streak >= 30) return '한 달 넘게 지속 중! 대단해요 🏆';
  if (streak >= 14) return '2주 연속! 습관이 돼가고 있어요 💪';
  if (streak >= 7) return '1주일 연속! 꾸준하네요 🔥';
  if (streak >= 3) return '좋은 흐름이에요! 계속 해봐요 ✨';
  if (streak >= 1) return '오늘도 리셋 완료!';
  return '오늘 첫 리셋을 시작해 봐요';
}

export default function History() {
  const [data, setData] = useState<SaveData | null>(null);
  const [history, setHistory] = useState<{ date: string; count: number }[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setData(loadData());
    setHistory(getLast7DaysHistory());
    setTotalCount(getTotalCount());
  }, []);

  const animatedStreak = useCountUp(data?.streak ?? 0);
  const animatedTotal = useCountUp(totalCount);

  if (!data) {
    return null;
  }

  const hasAnyRecord = totalCount > 0;

  const sortedMoodStats = Object.entries(data.moodStats)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  const sortedModeStats = Object.entries(data.modeStats)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div css={containerStyle}>
      <div css={titleStyle}>
        <Text typography="t2" fontWeight="bold">
          기록
        </Text>
      </div>

      {/* 스트릭 카드 */}
      <div css={streakCardStyle}>
        <div css={css`display: flex; align-items: center; gap: 8px;`}>
          <Asset.Icon
            name="icon-trophy-mono"
            color="#fff"
            frameShape={Asset.frameShape.CleanW20}
            style={{ opacity: 0.9 }}
          />
          <Text typography="t5" color="#fff" style={{ opacity: 0.9 }}>
            연속으로 리셋한 날
          </Text>
        </div>
        <div css={streakRow}>
          <Text typography="t1" fontWeight="bold" color="#fff">
            {animatedStreak}
          </Text>
          <Text typography="t4" fontWeight="medium" color="#fff">
            일
          </Text>
        </div>
        <div css={streakMsgStyle}>
          <Text typography="t6" color="#fff">
            {getStreakMessage(data.streak)}
          </Text>
        </div>
      </div>

      {/* 요약 카드 */}
      <div css={summaryRowStyle}>
        <div css={summaryCardStyle}>
          <Asset.Icon
            name="icon-clock-mono"
            color="#8B95A1"
            frameShape={Asset.frameShape.CleanW20}
          />
          <Text typography="t7" color="#8B95A1">오늘</Text>
          <Text typography="t3" fontWeight="bold" color="#3182F6">
            {data.todayCount}회
          </Text>
        </div>
        <div css={summaryCardStyle}>
          <Asset.Icon
            name="icon-chart-mono"
            color="#8B95A1"
            frameShape={Asset.frameShape.CleanW20}
          />
          <Text typography="t7" color="#8B95A1">전체</Text>
          <Text typography="t3" fontWeight="bold" color="#3182F6">
            {animatedTotal}회
          </Text>
        </div>
      </div>

      {/* 최근 7일 캘린더 */}
      <div css={sectionStyle}>
        <div css={sectionTitleStyle}>
          <Text typography="t5" fontWeight="bold">
            최근 7일
          </Text>
        </div>

        <div css={calendarStyle}>
          {history.map((item, index) => {
            const date = new Date(item.date + 'T00:00:00');
            const dayOfWeek = date.getDay();
            const dayNum = date.getDate();
            const isToday = item.date === todayStr;

            return (
              <div
                key={item.date}
                css={css`animation: ${fadeSlideIn} 0.3s ease-out ${index * 0.05}s both;`}
              >
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
        <div css={[statsGridStyle, css`animation: ${fadeSlideIn} 0.4s ease-out 0.3s both;`]}>
          <div css={statCardStyle}>
            <Text typography="t6" fontWeight="bold" color="#333D4B" style={{ marginBottom: 12 }}>
              감정별
            </Text>
            {sortedMoodStats.length > 0 ? (
              sortedMoodStats.slice(0, 4).map(([mood, count]) => (
                <div key={mood} css={statItemStyle}>
                  <div css={statLabelStyle}>
                    <Asset.Frame
                      shape={Asset.frameShape.CircleXSmall}
                      backgroundColor="#F2F4F6"
                      content={<span style={{ fontSize: 12 }}>{MOOD_ICONS[mood as Mood]}</span>}
                    />
                    <Text typography="t7" color="#6B7684">
                      {MOOD_LABELS[mood as Mood]}
                    </Text>
                  </div>
                  <Text typography="t6" fontWeight="bold" color="#3182F6">
                    {count}회
                  </Text>
                </div>
              ))
            ) : (
              <Text typography="t7" color="#8B95A1">
                기록이 생기면 여기에 보여요
              </Text>
            )}
          </div>

          <div css={statCardStyle}>
            <Text typography="t6" fontWeight="bold" color="#333D4B" style={{ marginBottom: 12 }}>
              모드별
            </Text>
            {sortedModeStats.length > 0 ? (
              sortedModeStats.map(([mode, count]) => (
                <div key={mode} css={statItemStyle}>
                  <div css={statLabelStyle}>
                    <Asset.Frame
                      shape={Asset.frameShape.CircleXSmall}
                      backgroundColor="#F2F4F6"
                      content={<span style={{ fontSize: 12 }}>{MISSION_INFO[mode as MissionMode].icon}</span>}
                    />
                    <Text typography="t7" color="#6B7684">
                      {MISSION_INFO[mode as MissionMode].label}
                    </Text>
                  </div>
                  <Text typography="t6" fontWeight="bold" color="#3182F6">
                    {count}회
                  </Text>
                </div>
              ))
            ) : (
              <Text typography="t7" color="#8B95A1">
                기록이 생기면 여기에 보여요
              </Text>
            )}
          </div>
        </div>
      ) : (
        <div css={emptyStateStyle}>
          <Text typography="t4" fontWeight="bold" color="#333D4B">
            기록이 생기면 여기에 보여요
          </Text>
          <Text typography="t6" color="#8B95A1" style={{ marginTop: 8 }}>
            첫 번째 60초 리셋을 시작해 봐요!
          </Text>
        </div>
      )}
    </div>
  );
}
