/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";
import {useNavigate, useLocation} from "react-router-dom";
import {useState, useCallback, useEffect, useRef} from "react";
import {Text, ConfirmDialog} from "@toss/tds-mobile";
import {Mood, MissionMode, MOOD_LABELS, MISSION_INFO, MISSION_SOUND_CONFIG} from "../types";
import {getSoundMuted, setSoundMuted} from "../stores/storage";
import {ambientSound} from "../utils/sound";
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

function SoundOnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#6B7684">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 002.5-3.5zM14 3.23v2.06a7 7 0 010 13.42v2.06A9 9 0 0014 3.23z" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#8B95A1">
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
  const [isMuted, setIsMuted] = useState(() => getSoundMuted());
  const soundInitialized = useRef(false);

  /* ── 세션 ID (stale cleanup 방지) ── */
  const sessionIdRef = useRef(0);

  /* ── 사운드 초기화 ── */
  const initSound = useCallback(async () => {
    if (soundInitialized.current || isMuted) return;
    const ok = await ambientSound.init();
    if (!ok) return;
    soundInitialized.current = true;

    const config = MISSION_SOUND_CONFIG[mode];
    for (const layer of config.layers) {
      ambientSound.play(layer.type, layer.volume);
    }
  }, [isMuted, mode]);

  const handleContentInteraction = useCallback(() => {
    if (!soundInitialized.current) {
      initSound();
    }
  }, [initSound]);

  /* ── 음소거 토글 ── */
  const handleSoundToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setSoundMuted(newMuted);

    if (newMuted) {
      ambientSound.setMuted(true);
    } else {
      ambientSound.setMuted(false);
      if (!soundInitialized.current) {
        initSound();
      }
    }
  }, [isMuted, initSound]);

  /* ── 클린업 (AudioContext 파괴 X → 레이어만 정리) ── */
  useEffect(() => {
    const mySession = ambientSound.nextSession();
    sessionIdRef.current = mySession;
    return () => {
      // 새 세션이 이미 시작됐으면 건드리지 않음
      if (ambientSound.sessionId !== mySession) return;
      ambientSound.stopAll(0.5);
      ambientSound.reset();
    };
  }, []);

  /* ── 마운트 시 사운드 자동 시작 ── */
  useEffect(() => {
    initSound();
  }, [initSound]);

  /* ── 백그라운드 → 포그라운드 복귀 시 AudioContext resume ── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !isMuted) {
        // suspended 상태면 resume
        ambientSound.init().then((ok) => {
          if (ok && !soundInitialized.current) {
            initSound();
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isMuted, initSound]);

  /* ── 미션 콜백: SlowTap 물방울 ── */
  const handleSlowTap = useCallback(() => {
    if (!isMuted && soundInitialized.current) {
      ambientSound.playOneShot('waterDrop');
    }
  }, [isMuted]);

  /* ── 미션 콜백: RapidTap 강도 변화 ── */
  const handleIntensityChange = useCallback((intensity: number) => {
    if (isMuted || !soundInitialized.current) return;
    ambientSound.setLayerVolume('rumble', intensity * 0.4, 0.1);
    if (intensity > 0.6) {
      ambientSound.play('steam', intensity * 0.2);
    } else {
      ambientSound.stopLayer('steam', 0.3);
    }
  }, [isMuted]);

  /* ── 미션 콜백: Grounding 섹션 전환 ── */
  const handleSectionChange = useCallback((section: string) => {
    if (isMuted || !soundInitialized.current) return;
    ambientSound.stopAll(0.5);
    setTimeout(() => {
      switch (section) {
        case 'see':  ambientSound.play('wind', 0.15); break;
        case 'hear': ambientSound.play('wind', 0.1); ambientSound.play('forest', 0.2); break;
        case 'feel': ambientSound.play('ocean', 0.2); break;
      }
    }, 300);
  }, [isMuted]);

  const handleClose = () => {
    setShowConfirm(true);
  };

  const handleComplete = () => {
    ambientSound.stopAll(0.5);
    navigate("/complete", {
      state: {mood, mode},
    });
  };

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
        <div css={headerRightStyle}>
          {ambientSound.isAvailable && (
            <div css={iconButtonStyle} onClick={handleSoundToggle} role="button" aria-label={isMuted ? '소리 켜기' : '소리 끄기'}>
              {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
            </div>
          )}
          <div css={iconButtonStyle} onClick={handleClose} role="button" aria-label="세션 중단하기">
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
          <ConfirmDialog.ConfirmButton onClick={() => { ambientSound.stopAll(0.3); navigate("/"); }}>
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
