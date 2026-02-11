/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";
import {useNavigate, useLocation} from "react-router-dom";
import {useState} from "react";
import {Text, ConfirmDialog} from "@toss/tds-mobile";
import {Mood, MissionMode, MOOD_LABELS, MISSION_INFO} from "../types";
import SessionTimer from "../components/SessionTimer";
import SlowTapMission from "../components/missions/SlowTapMission";
import GroundingMission from "../components/missions/GroundingMission";
import HoldReleaseMission from "../components/missions/HoldReleaseMission";
import RapidTapMission from "../components/missions/RapidTapMission";

const containerStyle = css`
  min-height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const headerStyle = css`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
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
  const mood = (location.state?.mood as Mood) || "anxiety";
  const mode = (location.state?.mode as MissionMode) || "slow_tap";
  const useTimer = mode !== "grounding_321";
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    setShowConfirm(true);
  };

  const handleComplete = () => {
    navigate("/complete", {
      state: {mood, mode},
    });
  };

  const renderMission = () => {
    switch (mode) {
      case "slow_tap":
        return <SlowTapMission onComplete={handleComplete} />;
      case "hold_release":
        return <HoldReleaseMission onComplete={handleComplete} />;
      case "grounding_321":
        return <GroundingMission onComplete={handleComplete} />;
      case "rapid_tap":
        return <RapidTapMission onComplete={handleComplete} />;
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
          <Text typography="t6" color="#E5E8EB">
            |
          </Text>
          <Text typography="t6" fontWeight="medium" color="#333D4B">
            {MISSION_INFO[mode].label}
          </Text>
        </div>
        <div css={closeButtonStyle} onClick={handleClose} role="button" aria-label="세션 중단하기">
          <CloseIcon />
        </div>
      </div>

      {useTimer && <SessionTimer durationMs={60000} onTimeUp={handleComplete} isPaused={showConfirm} />}

      <div css={contentStyle}>{renderMission()}</div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="세션을 중단할래요?"
        description="지금까지의 진행은 저장되지 않아요"
        confirmButton={
          <ConfirmDialog.ConfirmButton onClick={() => navigate("/")}>
            중단하기
          </ConfirmDialog.ConfirmButton>
        }
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setShowConfirm(false)}>
            계속하기
          </ConfirmDialog.CancelButton>
        }
      />
    </div>
  );
}
