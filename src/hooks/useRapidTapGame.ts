import { useState, useRef, useCallback, useEffect } from 'react';
import { RAPID_TAP_CONFIG, getComboMessage } from '../config/missionConfig';
import { RAPID_TAP_MESSAGES, getRandomMessage } from '../config/messages';
import { haptic } from '../utils/haptic';

export function useRapidTapGame(onIntensityChange?: (intensity: number) => void) {
  const [count, setCount] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [tps, setTps] = useState(0);
  const [encourageMsg, setEncourageMsg] = useState('');
  const [showEruption, setShowEruption] = useState(false);

  const tapTimestamps = useRef<number[]>([]);
  const isCompleted = useRef(false);
  const prevMsgIndexRef = useRef(-1);
  const prevIntensityRef = useRef(0);

  // intensity 변화 콜백
  useEffect(() => {
    if (Math.abs(intensity - prevIntensityRef.current) > 0.05) {
      prevIntensityRef.current = intensity;
      onIntensityChange?.(intensity);
    }
  }, [intensity, onIntensityChange]);

  // intensity 감쇠 (100ms마다 -0.008 -> 초당 -0.08)
  useEffect(() => {
    const timer = setInterval(() => {
      setIntensity(prev => Math.max(0, prev - RAPID_TAP_CONFIG.decayRate));
      const now = Date.now();
      tapTimestamps.current = tapTimestamps.current.filter(t => now - t < 1000);
      setTps(tapTimestamps.current.length);
    }, RAPID_TAP_CONFIG.decayInterval);
    return () => clearInterval(timer);
  }, []);

  const handleTap = useCallback(() => {
    if (isCompleted.current) return;

    const currentIntensity = intensity;
    if (currentIntensity > 0.7) {
      haptic.heavy();
    } else if (currentIntensity > 0.5) {
      haptic.medium();
    } else {
      haptic.tap();
    }

    const now = Date.now();
    tapTimestamps.current.push(now);

    setCount(prev => {
      const next = prev + 1;
      if (next % 50 === 0) haptic.success();
      if (next % 10 === 0) {
        const [msg, idx] = getRandomMessage(RAPID_TAP_MESSAGES, prevMsgIndexRef.current);
        prevMsgIndexRef.current = idx;
        setEncourageMsg(msg);
      }
      return next;
    });

    setIntensity(prev => {
      const next = Math.min(1, prev + RAPID_TAP_CONFIG.tapIncrease);
      // 폭발 이펙트 트리거
      if (next > RAPID_TAP_CONFIG.eruptionThreshold && prev <= RAPID_TAP_CONFIG.eruptionThreshold) {
        setShowEruption(true);
        setTimeout(() => setShowEruption(false), 800);
      }
      return next;
    });
  }, [intensity]);

  const comboMessage = getComboMessage(tps);

  return { count, intensity, tps, encourageMsg, showEruption, comboMessage, handleTap };
}
