/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Session from '../Session';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useAudioSession', () => ({
  useAudioSession: vi.fn(() => ({
    isMuted: false,
    isAvailable: true,
    handleSoundToggle: vi.fn(),
    handleContentInteraction: vi.fn(),
    stopSound: vi.fn(),
    missionCallbacks: {
      handleSlowTap: vi.fn(),
      handleIntensityChange: vi.fn(),
      handleSectionChange: vi.fn(),
    },
  })),
}));

vi.mock('../../components/SessionTimer', () => ({
  default: ({ onTimeUp }: { onTimeUp: () => void }) => {
    return <div data-testid="session-timer"><button onClick={onTimeUp}>timeup</button></div>;
  },
}));

vi.mock('../../components/missions/SlowTapMission', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => <div data-testid="slow-tap-mission"><button onClick={onComplete}>complete</button></div>,
}));
vi.mock('../../components/missions/HoldReleaseMission', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => <div data-testid="hold-release-mission"><button onClick={onComplete}>complete</button></div>,
}));
vi.mock('../../components/missions/GroundingMission', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => <div data-testid="grounding-mission"><button onClick={onComplete}>complete</button></div>,
}));
vi.mock('../../components/missions/RapidTapMission', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => <div data-testid="rapid-tap-mission"><button onClick={onComplete}>complete</button></div>,
}));

function renderSession(mood = 'anxiety', mode = 'slow_tap') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/session', state: { mood, mode } }]}>
      <Session />
    </MemoryRouter>,
  );
}

describe('Session', () => {
  it('should render mission label', () => {
    renderSession('anxiety', 'slow_tap');
    expect(screen.getByText('천천히 터치')).toBeInTheDocument();
  });

  it('should render mood label', () => {
    renderSession('anxiety', 'slow_tap');
    expect(screen.getByText('불안')).toBeInTheDocument();
  });

  it('should render slow_tap mission', () => {
    renderSession('anxiety', 'slow_tap');
    expect(screen.getByTestId('slow-tap-mission')).toBeInTheDocument();
  });

  it('should render hold_release mission', () => {
    renderSession('anger', 'hold_release');
    expect(screen.getByTestId('hold-release-mission')).toBeInTheDocument();
  });

  it('should render grounding_321 mission', () => {
    renderSession('focus', 'grounding_321');
    expect(screen.getByTestId('grounding-mission')).toBeInTheDocument();
  });

  it('should render rapid_tap mission', () => {
    renderSession('anger', 'rapid_tap');
    expect(screen.getByTestId('rapid-tap-mission')).toBeInTheDocument();
  });

  it('should show timer for non-grounding missions', () => {
    renderSession('anxiety', 'slow_tap');
    expect(screen.getByTestId('session-timer')).toBeInTheDocument();
  });

  it('should not show timer for grounding_321', () => {
    renderSession('focus', 'grounding_321');
    expect(screen.queryByTestId('session-timer')).not.toBeInTheDocument();
  });

  it('should show confirm dialog on close click', () => {
    renderSession();
    fireEvent.click(screen.getByLabelText('세션 중단하기'));
    expect(screen.getByText('세션을 중단할래요?')).toBeInTheDocument();
  });

  it('should navigate home on confirm quit', () => {
    renderSession();
    fireEvent.click(screen.getByLabelText('세션 중단하기'));
    fireEvent.click(screen.getByTestId('confirm-confirm-btn'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should close dialog on cancel', () => {
    renderSession();
    fireEvent.click(screen.getByLabelText('세션 중단하기'));
    fireEvent.click(screen.getByTestId('confirm-cancel-btn'));
    expect(screen.queryByTestId('tds-confirmdialog')).not.toBeInTheDocument();
  });

  it('should render sound toggle button', () => {
    renderSession();
    expect(screen.getByLabelText('소리 끄기')).toBeInTheDocument();
  });

  it('should navigate to complete when mission completes', () => {
    renderSession('anxiety', 'slow_tap');
    fireEvent.click(screen.getByText('complete'));
    expect(mockNavigate).toHaveBeenCalledWith('/complete', { state: { mood: 'anxiety', mode: 'slow_tap' } });
  });
});
