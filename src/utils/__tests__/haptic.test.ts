import { haptic } from '../haptic';
import { generateHapticFeedback } from '@apps-in-toss/web-bridge';
import { vi } from 'vitest';

const mockHaptic = vi.mocked(generateHapticFeedback);

describe('haptic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['light', 'tickWeak'],
    ['tap', 'tap'],
    ['medium', 'tickMedium'],
    ['heavy', 'basicMedium'],
    ['soft', 'softMedium'],
    ['success', 'success'],
    ['error', 'error'],
    ['wiggle', 'wiggle'],
    ['confetti', 'confetti'],
  ] as const)('haptic.%s() should call generateHapticFeedback with type "%s"', (method, type) => {
    haptic[method]();
    expect(mockHaptic).toHaveBeenCalledWith({ type });
  });

  it('release() should call softMedium then tap after 80ms', () => {
    haptic.release();
    expect(mockHaptic).toHaveBeenCalledWith({ type: 'softMedium' });
    expect(mockHaptic).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(80);
    expect(mockHaptic).toHaveBeenCalledWith({ type: 'tap' });
    expect(mockHaptic).toHaveBeenCalledTimes(2);
  });

  it('should not throw when bridge fails', () => {
    mockHaptic.mockRejectedValueOnce(new Error('Bridge error'));
    expect(() => haptic.light()).not.toThrow();
  });
});
