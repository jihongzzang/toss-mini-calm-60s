import { pickRandom } from '../pickRandom';

describe('pickRandom', () => {
  it('should return n items from array', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr, 3);
    expect(result).toHaveLength(3);
    result.forEach(item => expect(arr).toContain(item));
  });

  it('should return empty array when n is 0', () => {
    expect(pickRandom([1, 2, 3], 0)).toHaveLength(0);
  });

  it('should return full array when n >= length', () => {
    const arr = [1, 2, 3];
    const result = pickRandom(arr, 5);
    expect(result).toHaveLength(3);
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    pickRandom(arr, 3);
    expect(arr).toEqual(copy);
  });

  it('should return unique items', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr, 3);
    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });
});
