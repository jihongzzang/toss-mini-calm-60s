import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useRapidTapGame } from '../useRapidTapGame';

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

vi.mock('../../config/messages', () => ({
  RAPID_TAP_MESSAGES: ['msg1', 'msg2'],
  getRandomMessage: vi.fn().mockReturnValue(['msg1', 0]),
}));

vi.mock('../../config/missionConfig', async () => {
  const actual = await vi.importActual('../../config/missionConfig');
  return actual;
});

describe('useRapidTapGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useRapidTapGame());
    expect(result.current.count).toBe(0);
    expect(result.current.intensity).toBe(0);
    expect(result.current.tps).toBe(0);
    expect(result.current.showEruption).toBe(false);
  });

  it('should increment count on tap', () => {
    const { result } = renderHook(() => useRapidTapGame());
    act(() => { result.current.handleTap(); });
    expect(result.current.count).toBe(1);
  });

  it('should increase intensity on tap', () => {
    const { result } = renderHook(() => useRapidTapGame());
    act(() => { result.current.handleTap(); });
    expect(result.current.intensity).toBeGreaterThan(0);
  });

  it('should decay intensity over time', () => {
    const { result } = renderHook(() => useRapidTapGame());
    act(() => { result.current.handleTap(); });
    const after = result.current.intensity;
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.intensity).toBeLessThan(after);
  });

  it('should call onIntensityChange when intensity changes significantly', () => {
    const onIntensityChange = vi.fn();
    const { result } = renderHook(() => useRapidTapGame(onIntensityChange));

    for (let i = 0; i < 3; i++) {
      act(() => { result.current.handleTap(); });
    }
    // Advance timers to trigger the useEffect
    act(() => { vi.advanceTimersByTime(100); });
    expect(onIntensityChange).toHaveBeenCalled();
  });

  it('should return comboMessage', () => {
    const { result } = renderHook(() => useRapidTapGame());
    expect(result.current.comboMessage).toBeDefined();
  });
});
