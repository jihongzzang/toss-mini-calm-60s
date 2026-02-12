/** @jsxImportSource @emotion/react */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import History from '../History';
import { loadData, getLast7DaysHistory, getTotalCount } from '../../stores/storage';

vi.mock('../../stores/storage', () => ({
  loadData: vi.fn(() => ({
    version: 1,
    lastCompletedDate: '2024-01-15',
    todayCount: 3,
    streak: 7,
    history: [{ date: '2024-01-15', count: 3 }],
    moodStats: { anxiety: 5, anger: 3, lethargy: 0, focus: 2, tension: 0, down: 0 },
    modeStats: { slow_tap: 4, hold_release: 2, grounding_321: 2, rapid_tap: 2 },
  })),
  getLast7DaysHistory: vi.fn(() => [
    { date: '2024-01-09', count: 0 },
    { date: '2024-01-10', count: 1 },
    { date: '2024-01-11', count: 0 },
    { date: '2024-01-12', count: 2 },
    { date: '2024-01-13', count: 0 },
    { date: '2024-01-14', count: 1 },
    { date: '2024-01-15', count: 3 },
  ]),
  getTotalCount: vi.fn(() => 10),
}));

vi.mock('../../hooks/useCountUp', () => ({
  useCountUp: vi.fn((target: number) => target),
}));

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <History />
    </MemoryRouter>,
  );
}

describe('History', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render title', () => {
    renderHistory();
    expect(screen.getByText('기록')).toBeInTheDocument();
  });

  it('should show streak count', () => {
    renderHistory();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should show streak message for 7 days', () => {
    renderHistory();
    expect(screen.getByText('1주일 연속! 꾸준하네요 🔥')).toBeInTheDocument();
  });

  it('should show today count', () => {
    renderHistory();
    // "3회" appears in both summary card and calendar — use getAllByText
    const matches = screen.getAllByText('3회');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('should show total count', () => {
    renderHistory();
    expect(screen.getByText('10회')).toBeInTheDocument();
  });

  it('should render 7-day calendar', () => {
    renderHistory();
    expect(screen.getByText('최근 7일')).toBeInTheDocument();
  });

  it('should render mood stats', () => {
    renderHistory();
    expect(screen.getByText('감정별')).toBeInTheDocument();
    expect(screen.getByText('불안')).toBeInTheDocument();
  });

  it('should render mode stats', () => {
    renderHistory();
    expect(screen.getByText('모드별')).toBeInTheDocument();
    expect(screen.getByText('천천히 터치')).toBeInTheDocument();
  });
});

describe('History empty state', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
    vi.mocked(loadData).mockReturnValue({
      version: 1, lastCompletedDate: null, todayCount: 0, streak: 0, history: [],
      moodStats: { anxiety: 0, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
      modeStats: { slow_tap: 0, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
    });
    vi.mocked(getTotalCount).mockReturnValue(0);
    vi.mocked(getLast7DaysHistory).mockReturnValue([
      { date: '2024-01-09', count: 0 }, { date: '2024-01-10', count: 0 },
      { date: '2024-01-11', count: 0 }, { date: '2024-01-12', count: 0 },
      { date: '2024-01-13', count: 0 }, { date: '2024-01-14', count: 0 },
      { date: '2024-01-15', count: 0 },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show empty state message', () => {
    renderHistory();
    expect(screen.getByText('기록이 생기면 여기에 보여요')).toBeInTheDocument();
  });

  it('should show streak message for 0', () => {
    renderHistory();
    expect(screen.getByText('오늘 첫 리셋을 시작해 봐요')).toBeInTheDocument();
  });
});
