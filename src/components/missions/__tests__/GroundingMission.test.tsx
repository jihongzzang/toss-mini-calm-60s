/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GroundingMission from '../GroundingMission';
import { useGroundingGame } from '../../../hooks/useGroundingGame';

const mockHandleSelect = vi.fn();
vi.mock('../../../hooks/useGroundingGame', () => ({
  useGroundingGame: vi.fn(() => ({
    sections: [
      { id: 'see', title: '보이는 것 3개', icon: '👁️', required: 3, options: ['시계', '창문', '모니터', '책', '컵', '손가락'], selected: new Set(['시계']) },
      { id: 'hear', title: '들리는 것 2개', icon: '👂', required: 2, options: ['에어컨 소리', '키보드 소리', '새소리', '시계 소리', '바람 소리'], selected: new Set() },
      { id: 'feel', title: '느껴지는 것 1개', icon: '✋', required: 1, options: ['발바닥의 바닥', '손 위의 공기', '의자에 닿는 등', '옷의 감촉'], selected: new Set() },
    ],
    activeSection: 'see',
    sectionJustActivated: false,
    celebratingSections: new Set(),
    animatingChip: null,
    encourageMsg: '잘하고 있어요!',
    totalSelected: 1,
    totalRequired: 6,
    progress: 1/6,
    handleSelect: mockHandleSelect,
  })),
}));

describe('GroundingMission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render section titles', () => {
    render(<GroundingMission onComplete={vi.fn()} />);
    expect(screen.getByText('보이는 것 3개')).toBeInTheDocument();
    expect(screen.getByText('들리는 것 2개')).toBeInTheDocument();
    expect(screen.getByText('느껴지는 것 1개')).toBeInTheDocument();
  });

  it('should render option chips', () => {
    render(<GroundingMission onComplete={vi.fn()} />);
    expect(screen.getByText('시계')).toBeInTheDocument();
    expect(screen.getByText('창문')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    render(<GroundingMission onComplete={vi.fn()} />);
    expect(screen.getByTestId('tds-progressbar')).toBeInTheDocument();
  });

  it('should render encouragement message', () => {
    render(<GroundingMission onComplete={vi.fn()} />);
    expect(screen.getByText('잘하고 있어요!')).toBeInTheDocument();
  });

  it('should call handleSelect on chip click', () => {
    render(<GroundingMission onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText('창문'));
    expect(mockHandleSelect).toHaveBeenCalledWith('see', '창문');
  });

  it('should render section icons', () => {
    render(<GroundingMission onComplete={vi.fn()} />);
    expect(screen.getByText('👁️')).toBeInTheDocument();
    expect(screen.getByText('👂')).toBeInTheDocument();
    expect(screen.getByText('✋')).toBeInTheDocument();
  });

  it('should render with completed sections', () => {
    vi.mocked(useGroundingGame).mockReturnValue({
      sections: [
        { id: 'see', title: '보이는 것 3개', icon: '👁️', required: 3, options: ['시계', '창문', '모니터'], selected: new Set(['시계', '창문', '모니터']) },
        { id: 'hear', title: '들리는 것 2개', icon: '👂', required: 2, options: ['에어컨 소리', '키보드 소리'], selected: new Set() },
        { id: 'feel', title: '느껴지는 것 1개', icon: '✋', required: 1, options: ['발바닥의 바닥'], selected: new Set() },
      ],
      activeSection: 'hear',
      sectionJustActivated: false,
      celebratingSections: new Set(['see']),
      animatingChip: null,
      encourageMsg: '훌륭해요!',
      totalSelected: 3,
      totalRequired: 6,
      progress: 3/6,
      handleSelect: mockHandleSelect,
    });

    render(<GroundingMission onComplete={vi.fn()} />);
    expect(screen.getByText('훌륭해요!')).toBeInTheDocument();
  });
});
