/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Complete from '../Complete';
import { recordCompletion } from '../../stores/storage';
import { haptic } from '../../utils/haptic';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../stores/storage', () => ({
  recordCompletion: vi.fn().mockReturnValue({
    version: 1, lastCompletedDate: '2024-01-15', todayCount: 1, streak: 1,
    history: [], moodStats: { anxiety: 1, anger: 0, lethargy: 0, focus: 0, tension: 0, down: 0 },
    modeStats: { slow_tap: 1, hold_release: 0, grounding_321: 0, rapid_tap: 0 },
  }),
}));

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

function renderComplete(mood = 'anxiety', mode = 'slow_tap') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/complete', state: { mood, mode } }]}>
      <Complete />
    </MemoryRouter>,
  );
}

describe('Complete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render success message', () => {
    renderComplete();
    expect(screen.getByText('좋아요, 여기까지 완료!')).toBeInTheDocument();
  });

  it('should call recordCompletion on mount', () => {
    renderComplete('anxiety', 'slow_tap');
    expect(recordCompletion).toHaveBeenCalledWith('anxiety', 'slow_tap');
  });

  it('should trigger confetti haptic after delay', () => {
    renderComplete();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(haptic.confetti).toHaveBeenCalled();
  });

  it('should render 3 action options', () => {
    renderComplete();
    expect(screen.getByText('물 마시기')).toBeInTheDocument();
    expect(screen.getByText('창문 열기')).toBeInTheDocument();
    expect(screen.getByText('10걸음 걷기')).toBeInTheDocument();
  });

  it('should toggle action selection', () => {
    renderComplete();
    fireEvent.click(screen.getByLabelText(/물 마시기/));
    expect(screen.getByLabelText(/물 마시기/)).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByLabelText(/물 마시기/));
    expect(screen.getByLabelText(/물 마시기/)).toHaveAttribute('aria-checked', 'false');
  });

  it('should navigate home on 홈으로 click', () => {
    renderComplete();
    fireEvent.click(screen.getByText('홈으로'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to session on retry click', () => {
    renderComplete('anxiety', 'slow_tap');
    fireEvent.click(screen.getByText('한 번 더 하기'));
    expect(mockNavigate).toHaveBeenCalledWith('/session', { state: { mood: 'anxiety', mode: 'slow_tap' } });
  });
});
