import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCountUp } from '../useCountUp';

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 0 when target is 0', () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current).toBe(0);
  });

  it('should animate towards target', () => {
    const { result } = renderHook(() => useCountUp(100, 800));
    // After some frames, value should be > 0
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBeGreaterThan(0);
  });

  it('should reach target after duration', () => {
    const { result } = renderHook(() => useCountUp(100, 800));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current).toBe(100);
  });

  it('should restart when target changes', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp(target, 800),
      { initialProps: { target: 50 } }
    );
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current).toBe(50);

    rerender({ target: 100 });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current).toBe(100);
  });
});
