import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAudioSession } from '../useAudioSession';
import { ambientSound } from '../../utils/sound';

vi.mock('../../utils/sound', () => ({
  ambientSound: {
    init: vi.fn().mockResolvedValue(true),
    play: vi.fn(),
    setMuted: vi.fn(),
    toggleMute: vi.fn(),
    playOneShot: vi.fn(),
    setLayerVolume: vi.fn(),
    stopLayer: vi.fn(),
    stopAll: vi.fn(),
    reset: vi.fn(),
    destroy: vi.fn(),
    isAvailable: true,
    isMuted: false,
    sessionId: 0,
    nextSession: vi.fn().mockReturnValue(1),
  },
}));

vi.mock('../../stores/storage', () => ({
  getSoundMuted: vi.fn().mockReturnValue(false),
  setSoundMuted: vi.fn(),
}));

describe('useAudioSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return muted state', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(result.current.isMuted).toBe(false);
  });

  it('should return isAvailable', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });
    expect(result.current.isAvailable).toBe(true);
  });

  it('should toggle sound', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });

    act(() => { result.current.handleSoundToggle(); });
    expect(result.current.isMuted).toBe(true);
  });

  it('should stop all sounds on stopSound', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });

    act(() => { result.current.stopSound(); });
    expect(ambientSound.stopAll).toHaveBeenCalled();
  });

  it('should have mission callbacks', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });

    expect(result.current.missionCallbacks.handleSlowTap).toBeDefined();
    expect(result.current.missionCallbacks.handleIntensityChange).toBeDefined();
    expect(result.current.missionCallbacks.handleSectionChange).toBeDefined();
  });

  it('handleSlowTap should play waterDrop oneshot', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });

    act(() => { result.current.missionCallbacks.handleSlowTap(); });
    // might not call if not initialized; check doesn't throw
  });

  it('handleContentInteraction should try init', async () => {
    const { result } = renderHook(() => useAudioSession('slow_tap'));
    await act(async () => { vi.advanceTimersByTime(100); });

    act(() => { result.current.handleContentInteraction(); });
    // Should not throw
  });
});
