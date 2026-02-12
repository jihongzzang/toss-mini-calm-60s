import { useState, useRef, useCallback, useEffect } from 'react';
import { SLOW_TAP_CONFIG } from '../config/missionConfig';
import { SLOW_TAP_MESSAGES, getRandomMessage } from '../config/messages';
import { haptic } from '../utils/haptic';

export function useSlowTapGame(onComplete: () => void, onTap?: () => void) {
  const [count, setCount] = useState(0);
  const [canTap, setCanTap] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [encourageMsg, setEncourageMsg] = useState('');

  const lastTapTime = useRef<number>(0);
  const prevMsgIndexRef = useRef(-1);

  const progress = count / SLOW_TAP_CONFIG.targetCount;

  const handleTap = useCallback((): boolean => {
    const now = Date.now();
    const interval = now - lastTapTime.current;

    if (lastTapTime.current > 0 && interval < SLOW_TAP_CONFIG.minInterval) {
      setShowWarning(true);
      haptic.light();
      setTimeout(() => setShowWarning(false), 1500);
      return false;
    }

    lastTapTime.current = now;
    haptic.tap();
    onTap?.();

    setCount(prev => prev + 1);

    const [msg, idx] = getRandomMessage(SLOW_TAP_MESSAGES, prevMsgIndexRef.current);
    prevMsgIndexRef.current = idx;
    setEncourageMsg(msg);

    setCanTap(false);
    setTimeout(() => {
      setCanTap(true);
    }, SLOW_TAP_CONFIG.cooldown);

    return true;
  }, [onTap]);

  useEffect(() => {
    if (count >= SLOW_TAP_CONFIG.targetCount) {
      haptic.success();
      onComplete();
    }
  }, [count, onComplete]);

  return { count, canTap, showWarning, encourageMsg, progress, handleTap };
}
