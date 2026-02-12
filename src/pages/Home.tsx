/** @jsxImportSource @emotion/react */
import {css, keyframes} from "@emotion/react";
import {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {Text, Button, Asset, AlertDialog} from "@toss/tds-mobile";
import {loadData} from "../stores/storage";
import {useCountUp} from "../hooks/useCountUp";
import {haptic} from "../utils/haptic";
import {Mood, MOOD_LABELS, MOOD_ICONS, MOOD_RECOMMENDED_MISSION, MISSION_INFO} from "../types";
import { primary, primaryLight, primarySelected, textPrimary, textSecondary, textMuted, surface, border } from '../styles/tokens';
import { tapHighlightReset } from '../styles/mixins';

const fadeSlideIn = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bounceSelect = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(0.92); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const containerStyle = css`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #fff;
`;

const titleStyle = css`
  margin-bottom: 32px;
  animation: ${fadeSlideIn} 0.6s ease-out;
`;

const subtitleStyle = css`
  animation: ${fadeSlideIn} 0.6s ease-out 0.1s both;
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
  padding: 14px 12px;
  border-radius: 12px;
  border: 1.5px solid ${isSelected ? primary : border};
  background: ${isSelected ? primarySelected : "#fff"};
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.2s;
  ${tapHighlightReset}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const moodEmojiStyle = css`
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const recommendStyle = css`
  margin-top: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: ${surface};
  border-radius: 12px;
  animation: ${fadeSlideIn} 0.3s ease-out;
`;

const statsStyle = css`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const statItemStyle = css`
  flex: 1;
  padding: 20px 16px;
  background: ${surface};
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ctaStyle = css`
  margin-top: auto;
  padding-top: 24px;
  padding-bottom: 12px;
`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "늦은 밤이에요, 마음을 달래볼까요?";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "오후도 힘내볼까요?";
  if (hour < 22) return "오늘 하루 수고했어요";
  return "편안한 밤이에요";
}

export default function Home() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [animatingMood, setAnimatingMood] = useState<Mood | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const prevMoodRef = useRef<Mood | null>(null);

  const animatedTodayCount = useCountUp(todayCount);
  const animatedStreak = useCountUp(streak);

  useEffect(() => {
    const data = loadData();
    setTodayCount(data.todayCount);
    setStreak(data.streak);
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    haptic.light();
    const next = selectedMood === mood ? null : mood;
    setSelectedMood(next);

    if (next && mood !== prevMoodRef.current) {
      setAnimatingMood(mood);
      setTimeout(() => setAnimatingMood(null), 300);
    }
    prevMoodRef.current = next;
  };

  const handleStart = () => {
    if (!selectedMood) {
      setShowAlert(true);
      return;
    }
    haptic.medium();
    navigate("/mode-select", {
      state: {mood: selectedMood},
    });
  };

  const recommendedMission = selectedMood ? MISSION_INFO[MOOD_RECOMMENDED_MISSION[selectedMood]] : null;

  const moods: Mood[] = ["anxiety", "anger", "lethargy", "focus", "tension", "down"];

  return (
    <div css={containerStyle}>
      <div css={titleStyle}>
        <Text typography="t4" color={textSecondary}>
          {getGreeting()}
        </Text>
        <div css={subtitleStyle}>
          <Text typography="t2" fontWeight="bold" style={{marginTop: 4}}>
            지금, 60초만 리셋
          </Text>
        </div>
      </div>

      <div css={sectionStyle}>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 6px;
          `}
        >
          <Asset.Icon name="icon-emoji-mono" color={textSecondary} frameShape={Asset.frameShape.CleanW20} />
          <Text typography="t5" fontWeight="medium" color={textSecondary}>
            지금 기분이 어때요?
          </Text>
        </div>
        <div css={moodGridStyle} role="radiogroup" aria-label="현재 기분 선택">
          {moods.map((mood, index) => (
            <div
              key={mood}
              css={[
                moodButtonStyle(selectedMood === mood),
                animatingMood === mood &&
                  css`
                    animation: ${bounceSelect} 0.3s ease-out;
                  `,
                css`
                  animation: ${fadeSlideIn} 0.3s ease-out ${0.1 + index * 0.05}s both;
                `,
              ]}
              onClick={() => handleMoodSelect(mood)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMoodSelect(mood); } }}
              tabIndex={0}
              role="radio"
              aria-checked={selectedMood === mood}
              aria-label={`${MOOD_ICONS[mood]} ${MOOD_LABELS[mood]}`}
            >
              <Asset.Frame
                shape={Asset.frameShape.CircleMedium}
                backgroundColor={selectedMood === mood ? primaryLight : surface}
                content={<span css={moodEmojiStyle}>{MOOD_ICONS[mood]}</span>}
              />
              <Text typography="t7" fontWeight={selectedMood === mood ? "bold" : "medium"} color={selectedMood === mood ? primary : textPrimary}>
                {MOOD_LABELS[mood]}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {recommendedMission && (
        <div css={recommendStyle}>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 4px;
            `}
          >
            <Asset.Icon name="icon-star-mono" color={textSecondary} frameShape={Asset.frameShape.CleanW16} />
            <Text typography="t7" color={textSecondary}>
              추천 모드
            </Text>
          </div>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 10px;
              margin-top: 8px;
            `}
          >
            <Asset.Frame
              shape={Asset.frameShape.SquircleSmall}
              backgroundColor={primaryLight}
              content={<span style={{fontSize: 16}}>{recommendedMission.icon}</span>}
            />
            <Text typography="t5" fontWeight="bold">
              {recommendedMission.label}
            </Text>
          </div>
        </div>
      )}

      <div css={sectionStyle}>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 6px;
          `}
        >
          <Asset.Icon name="icon-chart-mono" color={textSecondary} frameShape={Asset.frameShape.CleanW20} />
          <Text typography="t5" fontWeight="medium" color={textSecondary}>
            오늘 통계
          </Text>
        </div>
        <div css={statsStyle}>
          <div css={statItemStyle}>
            <Asset.Icon name="icon-check-circle-mono" color={textMuted} frameShape={Asset.frameShape.CleanW24} />
            <Text typography="t7" color={textMuted}>
              오늘 완료
            </Text>
            <Text typography="t3" fontWeight="bold" color={primary}>
              {animatedTodayCount}회
            </Text>
          </div>
          <div css={statItemStyle}>
            <Asset.Icon name="icon-trophy-mono" color={textMuted} frameShape={Asset.frameShape.CleanW24} />
            <Text typography="t7" color={textMuted}>
              연속
            </Text>
            <Text typography="t3" fontWeight="bold" color={primary}>
              {animatedStreak}일
            </Text>
          </div>
        </div>
      </div>
      <div css={ctaStyle}>
        <Button display="block" size="xlarge" color="primary" onClick={handleStart}>
          시작
        </Button>
      </div>
      <div style={{minHeight: "48px"}} />

      <AlertDialog
        open={showAlert}
        onClose={() => setShowAlert(false)}
        title="감정을 선택해 주세요"
        description="기분에 맞는 모드를 추천해 줄게요"
        alertButton={
          <AlertDialog.AlertButton onClick={() => setShowAlert(false)}>
            확인
          </AlertDialog.AlertButton>
        }
      />
    </div>
  );
}
