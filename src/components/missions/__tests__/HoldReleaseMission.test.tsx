/** @jsxImportSource @emotion/react */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import HoldReleaseMission from '../HoldReleaseMission';
import { useHoldReleaseGame } from '../../../hooks/useHoldReleaseGame';

vi.mock('../../../hooks/useHoldReleaseGame', () => ({
  useHoldReleaseGame: vi.fn(() => ({
    count: 3,
    phase: 'ready' as const,
    holdProgress: 0,
    releaseProgress: 0,
    animateCount: false,
    encourageMsg: '잘하고 있어요!',
    showBloomed: false,
    progress: 3/10,
    flowerScale: 0,
    breathScale: 1,
    currentFlowerColor: '#F48FB1',
    guideText: '화분을 꾹 눌러봐요',
    handlePressStart: vi.fn(),
    handlePressEnd: vi.fn(),
  })),
}));

describe('HoldReleaseMission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHoldReleaseGame).mockReturnValue({
      count: 3,
      phase: 'ready' as const,
      holdProgress: 0,
      releaseProgress: 0,
      animateCount: false,
      encourageMsg: '잘하고 있어요!',
      showBloomed: false,
      progress: 3/10,
      flowerScale: 0,
      breathScale: 1,
      currentFlowerColor: '#F48FB1',
      guideText: '화분을 꾹 눌러봐요',
      handlePressStart: vi.fn(),
      handlePressEnd: vi.fn(),
    });
  });

  it('should render count', () => {
    render(<HoldReleaseMission onComplete={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render guide text', () => {
    // When phase === 'ready' and encourageMsg is truthy, encourageMsg is shown.
    // To show guideText, set encourageMsg to empty.
    vi.mocked(useHoldReleaseGame).mockReturnValue({
      count: 3,
      phase: 'ready' as const,
      holdProgress: 0,
      releaseProgress: 0,
      animateCount: false,
      encourageMsg: '',
      showBloomed: false,
      progress: 3/10,
      flowerScale: 0,
      breathScale: 1,
      currentFlowerColor: '#F48FB1',
      guideText: '화분을 꾹 눌러봐요',
      handlePressStart: vi.fn(),
      handlePressEnd: vi.fn(),
    });
    render(<HoldReleaseMission onComplete={vi.fn()} />);
    expect(screen.getByText('화분을 꾹 눌러봐요')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    render(<HoldReleaseMission onComplete={vi.fn()} />);
    expect(screen.getByTestId('tds-progressbar')).toBeInTheDocument();
  });

  it('should render encouragement message', () => {
    render(<HoldReleaseMission onComplete={vi.fn()} />);
    expect(screen.getByText('잘하고 있어요!')).toBeInTheDocument();
  });

  it('should render with holding phase', () => {
    vi.mocked(useHoldReleaseGame).mockReturnValue({
      count: 5,
      phase: 'holding' as const,
      holdProgress: 0.5,
      releaseProgress: 0,
      animateCount: false,
      encourageMsg: '조금만 더!',
      showBloomed: false,
      progress: 5/10,
      flowerScale: 0.5,
      breathScale: 1,
      currentFlowerColor: '#F48FB1',
      guideText: '계속 누르고 있어요...',
      handlePressStart: vi.fn(),
      handlePressEnd: vi.fn(),
    });

    render(<HoldReleaseMission onComplete={vi.fn()} />);
    expect(screen.getByText('계속 누르고 있어요...')).toBeInTheDocument();
  });

  it('should render with releasing phase', () => {
    vi.mocked(useHoldReleaseGame).mockReturnValue({
      count: 5,
      phase: 'releasing' as const,
      holdProgress: 1,
      releaseProgress: 0.3,
      animateCount: false,
      encourageMsg: '천천히 숨을 내쉬어요',
      showBloomed: false,
      progress: 5/10,
      flowerScale: 1,
      breathScale: 1.2,
      currentFlowerColor: '#F48FB1',
      guideText: '이제 천천히 놓아보세요',
      handlePressStart: vi.fn(),
      handlePressEnd: vi.fn(),
    });

    render(<HoldReleaseMission onComplete={vi.fn()} />);
    expect(screen.getByText('이제 천천히 놓아보세요')).toBeInTheDocument();
  });
});
