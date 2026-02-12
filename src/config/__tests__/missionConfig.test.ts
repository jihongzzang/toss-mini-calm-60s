import {
  SLOW_TAP_CONFIG,
  HOLD_RELEASE_CONFIG,
  RAPID_TAP_CONFIG,
  GROUNDING_CONFIG,
  getComboMessage,
} from '../missionConfig';

describe('missionConfig', () => {
  it('SLOW_TAP_CONFIG should have required properties', () => {
    expect(SLOW_TAP_CONFIG.targetCount).toBe(30);
    expect(SLOW_TAP_CONFIG.minInterval).toBe(1500);
    expect(SLOW_TAP_CONFIG.cooldown).toBe(2000);
  });

  it('HOLD_RELEASE_CONFIG should have required properties', () => {
    expect(HOLD_RELEASE_CONFIG.targetCount).toBe(10);
    expect(HOLD_RELEASE_CONFIG.holdDuration).toBe(4000);
    expect(HOLD_RELEASE_CONFIG.releaseDuration).toBe(2000);
    expect(HOLD_RELEASE_CONFIG.bloomDelay).toBe(800);
    expect(HOLD_RELEASE_CONFIG.flowerColors.length).toBeGreaterThan(0);
    expect(HOLD_RELEASE_CONFIG.leafGreen).toBeDefined();
    expect(HOLD_RELEASE_CONFIG.stemGreen).toBeDefined();
  });

  it('RAPID_TAP_CONFIG should have required properties', () => {
    expect(RAPID_TAP_CONFIG.decayRate).toBeDefined();
    expect(RAPID_TAP_CONFIG.decayInterval).toBeDefined();
    expect(RAPID_TAP_CONFIG.tapIncrease).toBeDefined();
    expect(RAPID_TAP_CONFIG.eruptionThreshold).toBeDefined();
    expect(RAPID_TAP_CONFIG.comboThresholds.length).toBeGreaterThan(0);
    expect(RAPID_TAP_CONFIG.crackPaths.length).toBeGreaterThan(0);
    expect(RAPID_TAP_CONFIG.eruptionColors.length).toBeGreaterThan(0);
  });

  it('GROUNDING_CONFIG should have required properties', () => {
    expect(GROUNDING_CONFIG.seeCount).toBe(3);
    expect(GROUNDING_CONFIG.hearCount).toBe(2);
    expect(GROUNDING_CONFIG.feelCount).toBe(1);
    expect(GROUNDING_CONFIG.totalRequired).toBe(6);
    expect(GROUNDING_CONFIG.seeOptions.length).toBeGreaterThan(0);
    expect(GROUNDING_CONFIG.hearOptions.length).toBeGreaterThan(0);
    expect(GROUNDING_CONFIG.feelOptions.length).toBeGreaterThan(0);
    expect(GROUNDING_CONFIG.sectionColors).toBeDefined();
    expect(GROUNDING_CONFIG.burstColors.length).toBeGreaterThan(0);
  });
});

describe('getComboMessage', () => {
  it('should return highest threshold message when tps >= 8', () => {
    expect(getComboMessage(8)).toBe('미쳤다!!!🤯');
    expect(getComboMessage(10)).toBe('미쳤다!!!🤯');
  });

  it('should return "불타오르는중🔥" for tps >= 6', () => {
    expect(getComboMessage(6)).toBe('불타오르는중🔥');
    expect(getComboMessage(7)).toBe('불타오르는중🔥');
  });

  it('should return "대단해요!!" for tps >= 4', () => {
    expect(getComboMessage(4)).toBe('대단해요!!');
    expect(getComboMessage(5)).toBe('대단해요!!');
  });

  it('should return "좋아요!" for tps >= 2', () => {
    expect(getComboMessage(2)).toBe('좋아요!');
    expect(getComboMessage(3)).toBe('좋아요!');
  });

  it('should return empty string for tps < 2', () => {
    expect(getComboMessage(1)).toBe('');
    expect(getComboMessage(0)).toBe('');
  });
});
