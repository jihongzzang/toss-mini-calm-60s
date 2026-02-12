import { useState, useEffect, useRef, useCallback } from 'react';
import { HOLD_RELEASE_CONFIG } from '../config/missionConfig';
import { HOLD_RELEASE_MESSAGES, getRandomMessage } from '../config/messages';
import { haptic } from '../utils/haptic';

export type Phase = 'ready' | 'holding' | 'releasing';

export function useHoldReleaseGame(onComplete: () => void) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [holdProgress, setHoldProgress] = useState(0);
  const [releaseProgress, setReleaseProgress] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState('');
  const [showBloomed, setShowBloomed] = useState(false);

  const holdStartTime = useRef<number>(0);
  const releaseStartTime = useRef<number>(0);
  const animationFrame = useRef<number>(0);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bloomedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMsgIndexRef = useRef(-1);

  const { targetCount, holdDuration, releaseDuration, bloomDelay, flowerColors } = HOLD_RELEASE_CONFIG;

  const progress = count / targetCount;
  const flowerScale = showBloomed ? 1 : (phase === 'releasing' ? releaseProgress : 0);

  const updateHoldProgress = useCallback(() => {
    const elapsed = Date.now() - holdStartTime.current;
    const newProgress = Math.min(elapsed / holdDuration, 1);
    setHoldProgress(newProgress);

    if (newProgress >= 1) {
      setPhase('releasing');
      releaseStartTime.current = Date.now();
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      haptic.release();
      animationFrame.current = requestAnimationFrame(updateReleaseProgress);
    } else {
      animationFrame.current = requestAnimationFrame(updateHoldProgress);
    }
  }, []);

  const updateReleaseProgress = useCallback(() => {
    const elapsed = Date.now() - releaseStartTime.current;
    const newProgress = Math.min(elapsed / releaseDuration, 1);
    setReleaseProgress(newProgress);

    if (newProgress >= 1) {
      setCount(prev => prev + 1);
      setAnimateCount(true);
      setTimeout(() => setAnimateCount(false), 300);

      const [msg, idx] = getRandomMessage(HOLD_RELEASE_MESSAGES, prevMsgIndexRef.current);
      prevMsgIndexRef.current = idx;
      setEncourageMsg(msg);

      // 만개된 꽃을 bloomDelay 동안 보여준 뒤 리셋
      setShowBloomed(true);
      bloomedTimeout.current = setTimeout(() => {
        setShowBloomed(false);
        setPhase('ready');
        setHoldProgress(0);
        setReleaseProgress(0);
      }, bloomDelay);
    } else {
      animationFrame.current = requestAnimationFrame(updateReleaseProgress);
    }
  }, []);

  const handlePressStart = useCallback(() => {
    if (phase !== 'ready' || showBloomed) return;

    setPhase('holding');
    holdStartTime.current = Date.now();
    haptic.medium();
    animationFrame.current = requestAnimationFrame(updateHoldProgress);

    hapticInterval.current = setInterval(() => {
      haptic.light();
    }, 500);
  }, [phase, showBloomed, updateHoldProgress]);

  const handlePressEnd = useCallback(() => {
    if (phase === 'holding') {
      cancelAnimationFrame(animationFrame.current);
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      setPhase('ready');
      setHoldProgress(0);
    }
  }, [phase]);

  // Completion check
  useEffect(() => {
    if (count >= targetCount) {
      haptic.success();
      onComplete();
    }
  }, [count, onComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrame.current);
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      if (bloomedTimeout.current) clearTimeout(bloomedTimeout.current);
    };
  }, []);

  const getGuideText = () => {
    switch (phase) {
      case 'ready': return '화분을 꾹 눌러봐요';
      case 'holding': return `새싹이 자라는 중... ${Math.ceil((holdDuration - holdProgress * holdDuration) / 1000)}초`;
      case 'releasing': return '꽃이 피어나요... 🌸';
    }
  };

  // 호흡 스케일
  const breathScale = phase === 'holding'
    ? 1 + 0.12 * holdProgress
    : phase === 'releasing'
    ? 1.12 - 0.12 * releaseProgress
    : 1;

  const currentFlowerColor = flowerColors[count % flowerColors.length];

  return {
    count,
    phase,
    holdProgress,
    releaseProgress,
    animateCount,
    encourageMsg,
    showBloomed,
    progress,
    flowerScale,
    breathScale,
    currentFlowerColor,
    guideText: getGuideText(),
    handlePressStart,
    handlePressEnd,
  };
}
