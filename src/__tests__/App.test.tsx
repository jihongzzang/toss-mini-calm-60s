/** @jsxImportSource @emotion/react */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';

// Mock all lazy-loaded pages
vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home</div>,
}));
vi.mock('../pages/ModeSelect', () => ({
  default: () => <div data-testid="mode-select-page">ModeSelect</div>,
}));
vi.mock('../pages/Session', () => ({
  default: () => <div data-testid="session-page">Session</div>,
}));
vi.mock('../pages/Complete', () => ({
  default: () => <div data-testid="complete-page">Complete</div>,
}));
vi.mock('../pages/History', () => ({
  default: () => <div data-testid="history-page">History</div>,
}));

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('should render Home on /', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('should render History on /history', async () => {
    renderApp('/history');
    await waitFor(() => {
      expect(screen.getByTestId('history-page')).toBeInTheDocument();
    });
  });

  it('should render ModeSelect on /mode-select', async () => {
    renderApp('/mode-select');
    await waitFor(() => {
      expect(screen.getByTestId('mode-select-page')).toBeInTheDocument();
    });
  });

  it('should render Session on /session', async () => {
    renderApp('/session');
    await waitFor(() => {
      expect(screen.getByTestId('session-page')).toBeInTheDocument();
    });
  });

  it('should render Complete on /complete', async () => {
    renderApp('/complete');
    await waitFor(() => {
      expect(screen.getByTestId('complete-page')).toBeInTheDocument();
    });
  });
});
