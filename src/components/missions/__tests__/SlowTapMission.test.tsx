/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SlowTapMission from '../SlowTapMission';
import { useSlowTapGame } from '../../../hooks/useSlowTapGame';

const mockHandleTap = vi.fn().mockReturnValue(true);
vi.mock('../../../hooks/useSlowTapGame', () => ({
  useSlowTapGame: vi.fn(() => ({
    count: 5,
    canTap: true,
    showWarning: false,
    encourageMsg: '좋아요!',
    progress: 5/30,
    handleTap: mockHandleTap,
  })),
}));

describe('SlowTapMission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSlowTapGame).mockReturnValue({
      count: 5,
      canTap: true,
      showWarning: false,
      encourageMsg: '좋아요!',
      progress: 5/30,
      handleTap: mockHandleTap,
    });
  });

  it('should render count', () => {
    render(<SlowTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render guide text when canTap', () => {
    render(<SlowTapMission onComplete={vi.fn()} />);
    // When canTap is true, guide text is shown (not encourageMsg)
    expect(screen.getByText('천천히 터치해 봐요')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    render(<SlowTapMission onComplete={vi.fn()} />);
    expect(screen.getByTestId('tds-progressbar')).toBeInTheDocument();
  });

  it('should call handleTap on tap area click', () => {
    render(<SlowTapMission onComplete={vi.fn()} />);
    const tapArea = screen.getByRole('button');
    fireEvent.click(tapArea);
    expect(mockHandleTap).toHaveBeenCalled();
  });

  it('should show warning when showWarning is true', () => {
    vi.mocked(useSlowTapGame).mockReturnValue({
      count: 3,
      canTap: false,
      showWarning: true,
      encourageMsg: '천천히!',
      progress: 3/30,
      handleTap: mockHandleTap,
    });

    render(<SlowTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('조금 더 천천히 터치해주세요')).toBeInTheDocument();
  });

  it('should show encourageMsg when canTap is false', () => {
    vi.mocked(useSlowTapGame).mockReturnValue({
      count: 5,
      canTap: false,
      showWarning: false,
      encourageMsg: '좋아요!',
      progress: 5/30,
      handleTap: mockHandleTap,
    });

    render(<SlowTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('좋아요!')).toBeInTheDocument();
  });
});
