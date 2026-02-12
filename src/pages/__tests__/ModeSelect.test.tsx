/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ModeSelect from '../ModeSelect';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../utils/haptic', () => ({
  haptic: {
    light: vi.fn(), tap: vi.fn(), medium: vi.fn(), heavy: vi.fn(),
    soft: vi.fn(), success: vi.fn(), error: vi.fn(), wiggle: vi.fn(),
    confetti: vi.fn(), release: vi.fn(),
  },
}));

function renderModeSelect(mood = 'anxiety') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/mode-select', state: { mood } }]}>
      <ModeSelect />
    </MemoryRouter>,
  );
}

describe('ModeSelect', () => {
  it('should render mood label', () => {
    renderModeSelect('anxiety');
    expect(screen.getByText('불안')).toBeInTheDocument();
  });

  it('should render title', () => {
    renderModeSelect();
    expect(screen.getByText('어떤 방식으로 리셋할까요?')).toBeInTheDocument();
  });

  it('should render 4 mission modes', () => {
    renderModeSelect();
    expect(screen.getByText('천천히 터치')).toBeInTheDocument();
    expect(screen.getByText('꾹 누르기')).toBeInTheDocument();
    expect(screen.getByText('오감 집중')).toBeInTheDocument();
    expect(screen.getByText('연타 모드')).toBeInTheDocument();
  });

  it('should show recommended badge', () => {
    renderModeSelect('anxiety');
    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('should pre-select recommended mode', () => {
    renderModeSelect('anxiety');
    // anxiety -> slow_tap recommended
    const slowTapRadio = screen.getByLabelText(/천천히 터치/);
    expect(slowTapRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('should select mode on click', () => {
    renderModeSelect();
    fireEvent.click(screen.getByLabelText(/연타 모드/));
    expect(screen.getByLabelText(/연타 모드/)).toHaveAttribute('aria-checked', 'true');
  });

  it('should navigate to session on start', () => {
    renderModeSelect('anxiety');
    fireEvent.click(screen.getByText('시작하기'));
    expect(mockNavigate).toHaveBeenCalledWith('/session', {
      state: { mood: 'anxiety', mode: 'slow_tap' },
    });
  });

  it('should handle different moods', () => {
    renderModeSelect('anger');
    expect(screen.getByText('짜증')).toBeInTheDocument();
    // anger -> rapid_tap recommended
    expect(screen.getByLabelText(/연타 모드/)).toHaveAttribute('aria-checked', 'true');
  });
});
