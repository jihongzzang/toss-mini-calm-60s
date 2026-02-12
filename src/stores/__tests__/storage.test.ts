import {
  getSoundMuted,
  setSoundMuted,
  getTodayDate,
  loadData,
  saveData,
  recordCompletion,
  getLast7DaysHistory,
  getTotalCount,
} from '../storage';
import { vi } from 'vitest';

describe('storage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getSoundMuted / setSoundMuted', () => {
    it('should return false by default', () => {
      expect(getSoundMuted()).toBe(false);
    });

    it('should persist and read muted state', () => {
      setSoundMuted(true);
      expect(getSoundMuted()).toBe(true);
      setSoundMuted(false);
      expect(getSoundMuted()).toBe(false);
    });
  });

  describe('getTodayDate', () => {
    it('should return YYYY-MM-DD format', () => {
      expect(getTodayDate()).toBe('2024-01-15');
    });

    it('should zero-pad months and days', () => {
      vi.setSystemTime(new Date('2024-03-05T12:00:00'));
      expect(getTodayDate()).toBe('2024-03-05');
    });
  });

  describe('loadData', () => {
    it('should return initial data when storage is empty', () => {
      const data = loadData();
      expect(data.version).toBe(1);
      expect(data.lastCompletedDate).toBeNull();
      expect(data.todayCount).toBe(0);
      expect(data.streak).toBe(0);
      expect(data.history).toEqual([]);
    });

    it('should parse valid saved data', () => {
      const saved = {
        version: 1,
        lastCompletedDate: '2024-01-15',
        todayCount: 3,
        streak: 5,
        history: [{ date: '2024-01-15', count: 3 }],
        moodStats: { anxiety: 1, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
        modeStats: { slow_tap: 1, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
      };
      localStorage.setItem('calm60_save_v1', JSON.stringify(saved));
      const data = loadData();
      expect(data.todayCount).toBe(3);
      expect(data.streak).toBe(5);
    });

    it('should reset todayCount when date changes', () => {
      const saved = {
        version: 1,
        lastCompletedDate: '2024-01-14',
        todayCount: 5,
        streak: 3,
        history: [],
        moodStats: { anxiety: 0, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
        modeStats: { slow_tap: 0, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
      };
      localStorage.setItem('calm60_save_v1', JSON.stringify(saved));
      const data = loadData();
      expect(data.todayCount).toBe(0);
    });

    it('should reset streak when gap > 1 day', () => {
      const saved = {
        version: 1,
        lastCompletedDate: '2024-01-12',
        todayCount: 1,
        streak: 10,
        history: [],
        moodStats: { anxiety: 0, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
        modeStats: { slow_tap: 0, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
      };
      localStorage.setItem('calm60_save_v1', JSON.stringify(saved));
      const data = loadData();
      expect(data.streak).toBe(0);
    });

    it('should keep streak when lastCompleted is yesterday', () => {
      const saved = {
        version: 1,
        lastCompletedDate: '2024-01-14',
        todayCount: 1,
        streak: 5,
        history: [],
        moodStats: { anxiety: 0, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
        modeStats: { slow_tap: 0, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
      };
      localStorage.setItem('calm60_save_v1', JSON.stringify(saved));
      const data = loadData();
      expect(data.streak).toBe(5);
    });

    it('should return initial data for corrupted JSON', () => {
      localStorage.setItem('calm60_save_v1', 'not valid json{{{');
      const data = loadData();
      expect(data.version).toBe(1);
      expect(data.todayCount).toBe(0);
    });
  });

  describe('saveData', () => {
    it('should call localStorage.setItem', () => {
      const data = loadData();
      saveData(data);
      expect(localStorage.setItem).toHaveBeenCalledWith('calm60_save_v1', JSON.stringify(data));
    });

    it('should not throw on QuotaExceeded', () => {
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => saveData(loadData())).not.toThrow();
    });
  });

  describe('recordCompletion', () => {
    it('should increment todayCount on same day', () => {
      const first = recordCompletion('anxiety', 'slow_tap');
      expect(first.todayCount).toBe(1);
      const second = recordCompletion('anxiety', 'slow_tap');
      expect(second.todayCount).toBe(2);
    });

    it('should reset todayCount on new day', () => {
      recordCompletion('anxiety', 'slow_tap');
      vi.setSystemTime(new Date('2024-01-16T12:00:00'));
      const data = recordCompletion('anger', 'rapid_tap');
      expect(data.todayCount).toBe(1);
    });

    it('should increment streak when yesterday', () => {
      recordCompletion('anxiety', 'slow_tap');
      vi.setSystemTime(new Date('2024-01-16T12:00:00'));
      const data = recordCompletion('anger', 'rapid_tap');
      expect(data.streak).toBe(2);
    });

    it('should reset streak on gap', () => {
      recordCompletion('anxiety', 'slow_tap');
      vi.setSystemTime(new Date('2024-01-18T12:00:00'));
      const data = recordCompletion('anger', 'rapid_tap');
      expect(data.streak).toBe(1);
    });

    it('should keep streak on same day', () => {
      const first = recordCompletion('anxiety', 'slow_tap');
      const second = recordCompletion('anger', 'rapid_tap');
      expect(second.streak).toBe(first.streak);
    });

    it('should add to history', () => {
      const data = recordCompletion('anxiety', 'slow_tap');
      expect(data.history).toContainEqual({ date: '2024-01-15', count: 1 });
    });

    it('should increment existing history entry count', () => {
      recordCompletion('anxiety', 'slow_tap');
      const data = recordCompletion('anger', 'rapid_tap');
      const entry = data.history.find(h => h.date === '2024-01-15');
      expect(entry?.count).toBe(2);
    });

    it('should trim history to 30 days', () => {
      // Pre-fill with old history
      const oldData = loadData();
      oldData.history = [{ date: '2023-11-01', count: 1 }];
      saveData(oldData);
      const data = recordCompletion('anxiety', 'slow_tap');
      expect(data.history.find(h => h.date === '2023-11-01')).toBeUndefined();
    });

    it('should update moodStats', () => {
      const data = recordCompletion('anxiety', 'slow_tap');
      expect(data.moodStats.anxiety).toBe(1);
    });

    it('should update modeStats', () => {
      const data = recordCompletion('anxiety', 'slow_tap');
      expect(data.modeStats.slow_tap).toBe(1);
    });

    it('should persist to localStorage', () => {
      recordCompletion('anxiety', 'slow_tap');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getLast7DaysHistory', () => {
    it('should return 7 entries', () => {
      const result = getLast7DaysHistory();
      expect(result).toHaveLength(7);
    });

    it('should include zeros for empty days', () => {
      const result = getLast7DaysHistory();
      result.forEach(entry => {
        expect(entry.count).toBe(0);
      });
    });

    it('should be in ascending date order', () => {
      const result = getLast7DaysHistory();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].date > result[i - 1].date).toBe(true);
      }
    });
  });

  describe('getTotalCount', () => {
    it('should return 0 for empty state', () => {
      expect(getTotalCount()).toBe(0);
    });

    it('should sum all moodStats', () => {
      recordCompletion('anxiety', 'slow_tap');
      recordCompletion('anger', 'rapid_tap');
      expect(getTotalCount()).toBe(2);
    });
  });
});
