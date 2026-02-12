/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Suppress console.error for expected errors
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('잠시 문제가 생겼어요')).toBeInTheDocument();
    expect(screen.getByText('다시 시도해 주세요')).toBeInTheDocument();
  });

  it('should show reset button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('홈으로 돌아가기')).toBeInTheDocument();
  });

  it('should redirect to / by default on reset', () => {
    const originalHref = window.location.href;
    delete (window as any).location;
    window.location = { href: '' } as Location;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByText('홈으로 돌아가기'));
    expect(window.location.href).toBe('/');

    window.location = { href: originalHref } as Location;
  });

  it('should redirect to custom fallbackRoute on reset', () => {
    delete (window as any).location;
    window.location = { href: '' } as Location;

    render(
      <ErrorBoundary fallbackRoute="/custom">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByText('홈으로 돌아가기'));
    expect(window.location.href).toBe('/custom');

    window.location = { href: '' } as Location;
  });

  it('should render emoji in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('😵‍💫')).toBeInTheDocument();
  });
});
