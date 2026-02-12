import { useState, useCallback, useEffect, useRef } from 'react';
import { MissionMode, MISSION_SOUND_CONFIG } from '../types';
import { getSoundMuted, setSoundMuted } from '../stores/storage';
import { ambientSound } from '../utils/sound';

export function useAudioSession(mode: MissionMode) {
  const [isMuted, setIsMuted] = useState(() => getSoundMuted());
  const soundInitialized = useRef(false);
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

  /* ── iOS Safari 폴백: 콘텐츠 인터랙션 시 사운드 시작 ── */
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

  /* ── 사운드 정지 (완료/중단 시 호출) ── */
  const stopSound = useCallback((fadeTime = 0.5) => {
    ambientSound.stopAll(fadeTime);
  }, []);

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

  return {
    isMuted,
    isAvailable: ambientSound.isAvailable,
    handleSoundToggle,
    handleContentInteraction,
    stopSound,
    missionCallbacks: {
      handleSlowTap,
      handleIntensityChange,
      handleSectionChange,
    },
  };
}
