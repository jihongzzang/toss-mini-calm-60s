/** @jsxImportSource @emotion/react */
import {css, keyframes} from "@emotion/react";
import {useState, useEffect, useMemo} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {Text, Button, Asset} from "@toss/tds-mobile";
import {recordCompletion} from "../stores/storage";
import {haptic} from "../utils/haptic";
import {Mood, MissionMode, CompleteAction, COMPLETE_ACTIONS} from "../types";

const circleScaleIn = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeUpIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const particleBurst = keyframes`
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
`;

const bounceSelect = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(0.95); }
  70% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const containerStyle = css`
  min-height: 100%;
  background: #fff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
`;

const successAreaStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px auto 24px;
`;

const successIconStyle = css`
  animation: ${circleScaleIn} 0.4s ease-out;
`;

const confettiContainerStyle = css`
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
`;

const confettiDotStyle = css`
  position: absolute;
  border-radius: 50%;
  animation: ${particleBurst} 0.8s ease-out forwards;
`;

const titleStyle = css`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeUpIn} 0.5s ease-out 0.6s both;
`;

const sectionStyle = css`
  margin-bottom: 24px;
  animation: ${fadeUpIn} 0.5s ease-out 0.8s both;
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
  border: 1.5px solid ${isSelected ? "#3182F6" : "#E5E8EB"};
  background: ${isSelected ? "#F2F7FF" : "#fff"};
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

const actionIconEmojiStyle = css`
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const radioStyle = (isSelected: boolean) => css`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${isSelected ? "#3182F6" : "#E5E8EB"};
  background: ${isSelected ? "#3182F6" : "#fff"};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  flex-shrink: 0;
  transition: all 0.2s;
`;

const ctaContainerStyle = css`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${fadeUpIn} 0.5s ease-out 1s both;
`;

const ACTION_ICONS: Record<CompleteAction, string> = {
  water: "💧",
  window: "🪟",
  walk: "👟",
};

const CONFETTI_COLORS = ["#3182F6", "#FF6B6B", "#FFD93D", "#6BCB77", "#B8D4FF"];

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({length: 24}, (_, i) => ({
        id: i,
        tx: (Math.random() - 0.5) * 240,
        ty: (Math.random() - 0.5) * 240,
        size: 4 + Math.random() * 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.3,
      })),
    [],
  );

  return (
    <div css={confettiContainerStyle}>
      {particles.map((p) => (
        <div
          key={p.id}
          css={confettiDotStyle}
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
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

export default function Complete() {
  const navigate = useNavigate();
  const location = useLocation();
  const mood = (location.state?.mood as Mood) || "anxiety";
  const mode = (location.state?.mode as MissionMode) || "slow_tap";

  const [selectedAction, setSelectedAction] = useState<CompleteAction | null>(null);
  const [animatingAction, setAnimatingAction] = useState<CompleteAction | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => haptic.confetti(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleActionSelect = (action: CompleteAction) => {
    haptic.light();
    setAnimatingAction(action);
    setSelectedAction(selectedAction === action ? null : action);
    setTimeout(() => setAnimatingAction(null), 300);
  };

  const handleSave = () => {
    haptic.success();
    recordCompletion(mood, mode);
    navigate("/");
  };

  const handleRetry = () => {
    navigate("/session", {
      state: {mood, mode},
    });
  };

  const actions: CompleteAction[] = ["water", "window", "walk"];

  return (
    <div css={containerStyle}>
      <div css={successAreaStyle}>
        <div css={successIconStyle}>
          <Asset.Icon name="icon-check-circle-mono" color="#3182F6" frameShape={{width: 80, height: 80, radius: 9999}} backgroundColor="#E8F3FF" />
        </div>
        <Confetti />
      </div>

      <div css={titleStyle}>
        <Text typography="t2" fontWeight="bold">
          좋아요, 여기까지 완료!
        </Text>
        <Text typography="t5" color="#6B7684" style={{marginTop: 8}}>
          60초 동안 잘 집중했어요
        </Text>
      </div>

      <div css={sectionStyle}>
        <Text typography="t5" fontWeight="medium" color="#333D4B">
          마무리로 뭘 해볼까요?
        </Text>
        <Text typography="t7" color="#8B95A1" style={{marginTop: 4, paddingLeft: 4}}>
          선택하지 않아도 괜찮아요
        </Text>

        <div css={actionListStyle} role="radiogroup" aria-label="마무리 활동 선택">
          {actions.map((action) => (
            <div
              key={action}
              css={[
                actionItemStyle(selectedAction === action),
                animatingAction === action &&
                  css`
                    animation: ${bounceSelect} 0.3s ease-out;
                  `,
              ]}
              onClick={() => handleActionSelect(action)}
              role="radio"
              aria-checked={selectedAction === action}
              aria-label={`${ACTION_ICONS[action]} ${COMPLETE_ACTIONS[action]}`}
            >
              <Asset.Frame
                shape={Asset.frameShape.CircleLarge}
                backgroundColor={selectedAction === action ? "#E8F3FF" : "#F8F9FA"}
                content={<span css={actionIconEmojiStyle}>{ACTION_ICONS[action]}</span>}
              />
              <Text
                typography="t5"
                fontWeight={selectedAction === action ? "bold" : "medium"}
                color={selectedAction === action ? "#3182F6" : "#333D4B"}
              >
                {COMPLETE_ACTIONS[action]}
              </Text>
              <div css={radioStyle(selectedAction === action)}>{selectedAction === action && <InnerDot />}</div>
            </div>
          ))}
        </div>
      </div>

      <div css={ctaContainerStyle}>
        <Button display="block" size="xlarge" color="primary" onClick={handleSave}>
          기록 남기기
        </Button>
        <Button display="block" size="xlarge" color="light" onClick={handleRetry}>
          한 번 더 하기
        </Button>
      </div>
    </div>
  );
}
