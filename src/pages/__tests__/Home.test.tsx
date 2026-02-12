/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../stores/storage', () => ({
  loadData: vi.fn(() => ({
    version: 1,
    lastCompletedDate: null,
    todayCount: 2,
    streak: 5,
    history: [],
    moodStats: { anxiety: 0, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
    modeStats: { slow_tap: 0, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
  })),
}));

vi.mock('../../hooks/useCountUp', () => ({
  useCountUp: vi.fn((target: number) => target),
}));

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Home />
    </MemoryRouter>,
  );
}

describe('Home', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T14:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render greeting', () => {
    renderHome();
    expect(screen.getByText('오후도 힘내볼까요?')).toBeInTheDocument();
  });

  it('should render title', () => {
    renderHome();
    expect(screen.getByText('지금, 60초만 리셋')).toBeInTheDocument();
  });

  it('should render 6 mood buttons', () => {
    renderHome();
    expect(screen.getByText('불안')).toBeInTheDocument();
    expect(screen.getByText('짜증')).toBeInTheDocument();
    expect(screen.getByText('무기력')).toBeInTheDocument();
    expect(screen.getByText('집중 안됨')).toBeInTheDocument();
    expect(screen.getByText('긴장됨')).toBeInTheDocument();
    expect(screen.getByText('다운됨')).toBeInTheDocument();
  });

  it('should select mood on click', () => {
    renderHome();
    fireEvent.click(screen.getByLabelText(/불안/));
    expect(screen.getByLabelText(/불안/)).toHaveAttribute('aria-checked', 'true');
  });

  it('should deselect mood on second click', () => {
    renderHome();
    fireEvent.click(screen.getByLabelText(/불안/));
    fireEvent.click(screen.getByLabelText(/불안/));
    expect(screen.getByLabelText(/불안/)).toHaveAttribute('aria-checked', 'false');
  });

  it('should show alert when start without mood', () => {
    renderHome();
    fireEvent.click(screen.getByText('시작'));
    expect(screen.getByText('감정을 선택해 주세요')).toBeInTheDocument();
  });

  it('should navigate to mode-select when mood selected and start clicked', () => {
    renderHome();
    fireEvent.click(screen.getByLabelText(/불안/));
    fireEvent.click(screen.getByText('시작'));
    expect(mockNavigate).toHaveBeenCalledWith('/mode-select', { state: { mood: 'anxiety' } });
  });

  it('should show recommended mission when mood selected', () => {
    renderHome();
    fireEvent.click(screen.getByLabelText(/불안/));
    expect(screen.getByText('추천 모드')).toBeInTheDocument();
  });

  it('should display stats', () => {
    renderHome();
    expect(screen.getByText('2회')).toBeInTheDocument();
    expect(screen.getByText('5일')).toBeInTheDocument();
  });

  it('should render greeting for morning', () => {
    vi.setSystemTime(new Date('2024-01-15T08:00:00'));
    renderHome();
    expect(screen.getByText('좋은 아침이에요')).toBeInTheDocument();
  });

  it('should render greeting for evening', () => {
    vi.setSystemTime(new Date('2024-01-15T20:00:00'));
    renderHome();
    expect(screen.getByText('오늘 하루 수고했어요')).toBeInTheDocument();
  });

  it('should render greeting for late night', () => {
    vi.setSystemTime(new Date('2024-01-15T23:00:00'));
    renderHome();
    expect(screen.getByText('편안한 밤이에요')).toBeInTheDocument();
  });

  it('should render greeting for very late night', () => {
    vi.setSystemTime(new Date('2024-01-15T03:00:00'));
    renderHome();
    expect(screen.getByText('늦은 밤이에요, 마음을 달래볼까요?')).toBeInTheDocument();
  });
});
