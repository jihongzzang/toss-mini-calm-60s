import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useGroundingGame } from '../useGroundingGame';

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

vi.mock('../../config/messages', () => ({
  GROUNDING_MESSAGES: ['msg1', 'msg2'],
  getRandomMessage: vi.fn().mockReturnValue(['msg1', 0]),
}));

vi.mock('../../utils/pickRandom', () => ({
  pickRandom: vi.fn((arr: string[], n: number) => arr.slice(0, n)),
}));

describe('useGroundingGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should have 3 sections', () => {
    const { result } = renderHook(() => useGroundingGame(vi.fn()));
    expect(result.current.sections).toHaveLength(3);
  });

  it('should start with activeSection = see', () => {
    const { result } = renderHook(() => useGroundingGame(vi.fn()));
    expect(result.current.activeSection).toBe('see');
  });

  it('should add selection on handleSelect', () => {
    const { result } = renderHook(() => useGroundingGame(vi.fn()));
    const option = result.current.sections[0].options[0];
    act(() => { result.current.handleSelect('see', option); });

    const seeSection = result.current.sections.find(s => s.id === 'see');
    expect(seeSection?.selected.has(option)).toBe(true);
    expect(result.current.totalSelected).toBe(1);
  });

  it('should ignore already selected options', () => {
    const { result } = renderHook(() => useGroundingGame(vi.fn()));
    const option = result.current.sections[0].options[0];
    act(() => { result.current.handleSelect('see', option); });
    act(() => { result.current.handleSelect('see', option); });

    const seeSection = result.current.sections.find(s => s.id === 'see');
    expect(seeSection?.selected.size).toBe(1);
  });

  it('should move to next section when current is filled', () => {
    const { result } = renderHook(() => useGroundingGame(vi.fn()));
    const options = result.current.sections[0].options;

    act(() => { result.current.handleSelect('see', options[0]); });
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { result.current.handleSelect('see', options[1]); });
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { result.current.handleSelect('see', options[2]); });
    act(() => { vi.advanceTimersByTime(700); });

    expect(result.current.activeSection).toBe('hear');
  });

  it('should call onSectionChange on section transition', () => {
    const onSectionChange = vi.fn();
    const { result } = renderHook(() => useGroundingGame(vi.fn(), onSectionChange));

    // Initial call for 'see'
    expect(onSectionChange).toHaveBeenCalledWith('see');
  });

  it('should call onComplete when all selected', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useGroundingGame(onComplete));

    // Fill see (3)
    const seeOpts = result.current.sections[0].options;
    act(() => { result.current.handleSelect('see', seeOpts[0]); });
    act(() => { result.current.handleSelect('see', seeOpts[1]); });
    act(() => { result.current.handleSelect('see', seeOpts[2]); });
    act(() => { vi.advanceTimersByTime(700); });

    // Fill hear (2)
    const hearOpts = result.current.sections[1].options;
    act(() => { result.current.handleSelect('hear', hearOpts[0]); });
    act(() => { result.current.handleSelect('hear', hearOpts[1]); });
    act(() => { vi.advanceTimersByTime(700); });

    // Fill feel (1)
    const feelOpts = result.current.sections[2].options;
    act(() => { result.current.handleSelect('feel', feelOpts[0]); });
    act(() => { vi.advanceTimersByTime(700); });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should calculate progress', () => {
    const { result } = renderHook(() => useGroundingGame(vi.fn()));
    expect(result.current.progress).toBe(0);

    const option = result.current.sections[0].options[0];
    act(() => { result.current.handleSelect('see', option); });
    expect(result.current.progress).toBeCloseTo(1 / 6);
  });
});
