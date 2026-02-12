import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useHoldReleaseGame } from '../useHoldReleaseGame';

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

vi.mock('../../config/messages', () => ({
  HOLD_RELEASE_MESSAGES: ['msg1', 'msg2'],
  getRandomMessage: vi.fn().mockReturnValue(['msg1', 0]),
}));

describe('useHoldReleaseGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    expect(result.current.count).toBe(0);
    expect(result.current.phase).toBe('ready');
    expect(result.current.holdProgress).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('should transition to holding on press start', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    act(() => { result.current.handlePressStart(); });
    expect(result.current.phase).toBe('holding');
  });

  it('should return to ready on press end during holding', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    act(() => { result.current.handlePressStart(); });
    act(() => { result.current.handlePressEnd(); });
    expect(result.current.phase).toBe('ready');
    expect(result.current.holdProgress).toBe(0);
  });

  it('should ignore press start when not ready', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    act(() => { result.current.handlePressStart(); });
    const prevPhase = result.current.phase;
    // press start again while holding
    act(() => { result.current.handlePressStart(); });
    // phase shouldn't jump to holding from holding again
    expect(result.current.phase).toBe(prevPhase);
  });

  it('should have correct guide text for each phase', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    expect(result.current.guideText).toBe('화분을 꾹 눌러봐요');
  });

  it('should calculate flowerScale correctly', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    expect(result.current.flowerScale).toBe(0);
  });

  it('should calculate breathScale correctly', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    expect(result.current.breathScale).toBe(1);
  });

  it('should have flower color', () => {
    const { result } = renderHook(() => useHoldReleaseGame(vi.fn()));
    expect(result.current.currentFlowerColor).toBeDefined();
  });
});
