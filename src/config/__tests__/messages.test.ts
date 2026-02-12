import {
  SLOW_TAP_MESSAGES,
  HOLD_RELEASE_MESSAGES,
  GROUNDING_MESSAGES,
  RAPID_TAP_MESSAGES,
  getRandomMessage,
} from '../messages';
import { vi } from 'vitest';

describe('messages', () => {
  it('SLOW_TAP_MESSAGES should not be empty', () => {
    expect(SLOW_TAP_MESSAGES.length).toBeGreaterThan(0);
  });

  it('HOLD_RELEASE_MESSAGES should not be empty', () => {
    expect(HOLD_RELEASE_MESSAGES.length).toBeGreaterThan(0);
  });

  it('GROUNDING_MESSAGES should not be empty', () => {
    expect(GROUNDING_MESSAGES.length).toBeGreaterThan(0);
  });

  it('RAPID_TAP_MESSAGES should not be empty', () => {
    expect(RAPID_TAP_MESSAGES.length).toBeGreaterThan(0);
  });
});

describe('getRandomMessage', () => {
  it('should return a message and index from the array', () => {
    const [msg, idx] = getRandomMessage(SLOW_TAP_MESSAGES, -1);
    expect(SLOW_TAP_MESSAGES).toContain(msg);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(SLOW_TAP_MESSAGES.length);
  });

  it('should avoid previous index', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2) // floor(0.2*15)=3 -> same as prev, retry
      .mockReturnValueOnce(0.5); // floor(0.5*15)=7 -> different

    const [, idx] = getRandomMessage(SLOW_TAP_MESSAGES, 3);
    expect(idx).not.toBe(3);
    vi.restoreAllMocks();
  });

  it('should allow same index when array has length 1', () => {
    const msgs = ['only one'];
    const [msg, idx] = getRandomMessage(msgs, 0);
    expect(msg).toBe('only one');
    expect(idx).toBe(0);
  });

  it('should work with prevIndex = -1 (initial)', () => {
    const [msg, idx] = getRandomMessage(GROUNDING_MESSAGES, -1);
    expect(GROUNDING_MESSAGES).toContain(msg);
    expect(idx).toBeGreaterThanOrEqual(0);
  });
});
