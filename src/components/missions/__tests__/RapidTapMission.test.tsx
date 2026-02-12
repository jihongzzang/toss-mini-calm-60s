/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RapidTapMission from '../RapidTapMission';
import { useRapidTapGame } from '../../../hooks/useRapidTapGame';

const mockHandleTap = vi.fn();
vi.mock('../../../hooks/useRapidTapGame', () => ({
  useRapidTapGame: vi.fn(() => ({
    count: 42,
    intensity: 0.5,
    tps: 3,
    encourageMsg: '그 에너지 좋아요!',
    showEruption: false,
    comboMessage: '좋아요!',
    handleTap: mockHandleTap,
  })),
}));

describe('RapidTapMission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRapidTapGame).mockReturnValue({
      count: 42,
      intensity: 0.5,
      tps: 3,
      encourageMsg: '그 에너지 좋아요!',
      showEruption: false,
      comboMessage: '좋아요!',
      handleTap: mockHandleTap,
    });
  });

  it('should render count', () => {
    render(<RapidTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render combo message', () => {
    render(<RapidTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('좋아요!')).toBeInTheDocument();
  });

  it('should render encouragement message', () => {
    render(<RapidTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('그 에너지 좋아요!')).toBeInTheDocument();
  });

  it('should call handleTap on tap area click', () => {
    render(<RapidTapMission onComplete={vi.fn()} />);
    const tapArea = screen.getByRole('button');
    fireEvent.click(tapArea);
    expect(mockHandleTap).toHaveBeenCalled();
  });

  it('should render with high intensity', () => {
    vi.mocked(useRapidTapGame).mockReturnValue({
      count: 80,
      intensity: 0.9,
      tps: 8,
      encourageMsg: '불타오르고 있어요!',
      showEruption: true,
      comboMessage: '화산 폭발!',
      handleTap: mockHandleTap,
    });

    render(<RapidTapMission onComplete={vi.fn()} />);
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('불타오르고 있어요!')).toBeInTheDocument();
  });

  it('should call onTap prop when provided', () => {
    render(<RapidTapMission onComplete={vi.fn()} />);
    const tapArea = screen.getByRole('button');
    fireEvent.click(tapArea);
    expect(mockHandleTap).toHaveBeenCalled();
  });
});
