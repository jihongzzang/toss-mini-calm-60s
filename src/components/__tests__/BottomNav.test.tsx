/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import BottomNav from '../BottomNav';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderBottomNav(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe('BottomNav', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should render two tabs', () => {
    renderBottomNav('/');
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('기록')).toBeInTheDocument();
  });

  it('should mark home tab as active on /', () => {
    renderBottomNav('/');
    expect(screen.getByLabelText('홈')).toHaveAttribute('aria-selected', 'true');
  });

  it('should mark history tab as active on /history', () => {
    renderBottomNav('/history');
    expect(screen.getByLabelText('기록')).toHaveAttribute('aria-selected', 'true');
  });

  it('should navigate on tab click', () => {
    renderBottomNav('/');
    fireEvent.click(screen.getByLabelText('기록'));
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('should navigate home on home tab click', () => {
    renderBottomNav('/history');
    fireEvent.click(screen.getByLabelText('홈'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should be hidden on /session', () => {
    renderBottomNav('/session');
    expect(screen.queryByText('홈')).not.toBeInTheDocument();
  });

  it('should be hidden on /mode-select', () => {
    renderBottomNav('/mode-select');
    expect(screen.queryByText('홈')).not.toBeInTheDocument();
  });

  it('should be hidden on /complete', () => {
    renderBottomNav('/complete');
    expect(screen.queryByText('홈')).not.toBeInTheDocument();
  });

  it('should have nav with aria-label', () => {
    renderBottomNav('/');
    expect(screen.getByLabelText('하단 탭 메뉴')).toBeInTheDocument();
  });
});
