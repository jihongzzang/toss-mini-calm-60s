/** @jsxImportSource @emotion/react */
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import SessionTimer from '../SessionTimer';
import { haptic } from '../../utils/haptic';

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

describe('SessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render initial time correctly', () => {
    render(<SessionTimer durationMs={60000} onTimeUp={vi.fn()} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('should render with default props', () => {
    render(<SessionTimer onTimeUp={vi.fn()} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('should count down over time', () => {
    render(<SessionTimer durationMs={60000} onTimeUp={vi.fn()} />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('0:50')).toBeInTheDocument();
  });

  it('should call onTimeUp when time expires', () => {
    const onTimeUp = vi.fn();
    render(<SessionTimer durationMs={3000} onTimeUp={onTimeUp} />);
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('should trigger warning haptic near end', () => {
    render(<SessionTimer durationMs={15000} onTimeUp={vi.fn()} />);
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(haptic.heavy).toHaveBeenCalled();
  });

  it('should pause when isPaused is true', () => {
    const { rerender } = render(
      <SessionTimer durationMs={60000} onTimeUp={vi.fn()} isPaused={false} />,
    );
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('0:50')).toBeInTheDocument();

    rerender(<SessionTimer durationMs={60000} onTimeUp={vi.fn()} isPaused={true} />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('0:50')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<SessionTimer durationMs={60000} onTimeUp={vi.fn()} size={200} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('should have aria-label with remaining time', () => {
    render(<SessionTimer durationMs={60000} onTimeUp={vi.fn()} />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '남은 시간 1:00');
  });
});
