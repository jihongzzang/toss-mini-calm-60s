/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";
import {useNavigate, useLocation} from "react-router-dom";
import {useState, useCallback} from "react";
import {Text, ConfirmDialog} from "@toss/tds-mobile";
import {Mood, MissionMode, MOOD_LABELS, MISSION_INFO} from "../types";
import {useAudioSession} from "../hooks/useAudioSession";
import { textPrimary, textSecondary, textMuted, border, borderLight } from '../styles/tokens';
import { tapHighlightReset } from '../styles/mixins';
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
  border-bottom: 1px solid ${borderLight};
`;

const headerLeftStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const headerRightStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const iconButtonStyle = css`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${tapHighlightReset}
`;

const contentStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={textPrimary}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={textSecondary}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 002.5-3.5zM14 3.23v2.06a7 7 0 010 13.42v2.06A9 9 0 0014 3.23z" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={textMuted}>
      <path d="M16.5 12A4.5 4.5 0 0014 8.5v2.09l2.44 2.44c.03-.17.06-.34.06-.53zm2.5 0a7 7 0 01-.57 2.8l1.45 1.45A8.94 8.94 0 0021 12a9 9 0 00-7-8.77v2.06A7 7 0 0119 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25a6.92 6.92 0 01-2.25 1.3v2.06a8.9 8.9 0 003.69-2.06l1.58 1.58L21 19.73l-1-1L4.27 3zM12 4l-1.88 1.88L12 7.76V4z" />
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

  const {
    isMuted,
    isAvailable,
    handleSoundToggle,
    handleContentInteraction,
    stopSound,
    missionCallbacks: { handleSlowTap, handleIntensityChange, handleSectionChange },
  } = useAudioSession(mode);

  const handleClose = () => {
    setShowConfirm(true);
  };

  const handleComplete = useCallback(() => {
    stopSound();
    navigate("/complete", {
      state: {mood, mode},
    });
  }, [stopSound, navigate, mood, mode]);

  const renderMission = () => {
    switch (mode) {
      case "slow_tap":
        return <SlowTapMission onComplete={handleComplete} onTap={handleSlowTap} />;
      case "hold_release":
        return <HoldReleaseMission onComplete={handleComplete} />;
      case "grounding_321":
        return <GroundingMission onComplete={handleComplete} onSectionChange={handleSectionChange} />;
      case "rapid_tap":
        return <RapidTapMission onComplete={handleComplete} onIntensityChange={handleIntensityChange} />;
      default:
        return null;
    }
  };

  return (
    <div css={containerStyle}>
      <div css={headerStyle}>
        <div css={headerLeftStyle}>
          <Text typography="t6" color={textSecondary}>
            {MOOD_LABELS[mood]}
          </Text>
          <Text typography="t6" color={border}>
            |
          </Text>
          <Text typography="t6" fontWeight="medium" color={textPrimary}>
            {MISSION_INFO[mode].label}
          </Text>
        </div>
        <div css={headerRightStyle}>
          {isAvailable && (
            <div css={iconButtonStyle} onClick={handleSoundToggle} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSoundToggle(); } }} tabIndex={0} role="button" aria-label={isMuted ? '소리 켜기' : '소리 끄기'}>
              {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
            </div>
          )}
          <div css={iconButtonStyle} onClick={handleClose} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClose(); } }} tabIndex={0} role="button" aria-label="세션 중단하기">
            <CloseIcon />
          </div>
        </div>
      </div>

      {useTimer && <SessionTimer durationMs={60000} onTimeUp={handleComplete} isPaused={showConfirm} />}

      <div css={contentStyle} onClick={handleContentInteraction}>{renderMission()}</div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="세션을 중단할래요?"
        description="지금까지의 진행은 저장되지 않아요"
        confirmButton={
          <ConfirmDialog.ConfirmButton onClick={() => { stopSound(0.3); navigate("/"); }}>
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
