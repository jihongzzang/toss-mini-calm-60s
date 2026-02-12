import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useSlowTapGame } from '../useSlowTapGame';

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(),
    tap: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
    soft: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    wiggle: vi.fn(),
    confetti: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock('../../config/messages', () => ({
  SLOW_TAP_MESSAGES: ['msg1', 'msg2', 'msg3'],
  getRandomMessage: vi.fn().mockReturnValue(['msg1', 0]),
}));

describe('useSlowTapGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have initial state', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));
    expect(result.current.count).toBe(0);
    expect(result.current.canTap).toBe(true);
    expect(result.current.showWarning).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('should increment count on valid tap', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));

    let success: boolean = false;
    act(() => { success = result.current.handleTap(); });
    expect(success).toBe(true);
    expect(result.current.count).toBe(1);
  });

  it('should show warning on fast tap', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));

    act(() => { result.current.handleTap(); });
    // Tap again immediately (< 1500ms)
    act(() => { vi.advanceTimersByTime(500); });

    let success: boolean = true;
    act(() => { success = result.current.handleTap(); });
    expect(success).toBe(false);
    expect(result.current.showWarning).toBe(true);
    expect(result.current.count).toBe(1); // unchanged
  });

  it('should clear warning after 1.5s', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));

    act(() => { result.current.handleTap(); });
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { result.current.handleTap(); });
    expect(result.current.showWarning).toBe(true);

    act(() => { vi.advanceTimersByTime(1500); });
    expect(result.current.showWarning).toBe(false);
  });

  it('should set canTap to false during cooldown', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));

    act(() => { result.current.handleTap(); });
    expect(result.current.canTap).toBe(false);

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.canTap).toBe(true);
  });

  it('should call onTap callback', () => {
    const onComplete = vi.fn();
    const onTap = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete, onTap));

    act(() => { result.current.handleTap(); });
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('should call onComplete at target count', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));

    for (let i = 0; i < 30; i++) {
      act(() => { vi.advanceTimersByTime(2000); });
      act(() => { result.current.handleTap(); });
    }

    expect(onComplete).toHaveBeenCalled();
  });

  it('should calculate progress', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useSlowTapGame(onComplete));

    act(() => { result.current.handleTap(); });
    expect(result.current.progress).toBeCloseTo(1 / 30);
  });
});
