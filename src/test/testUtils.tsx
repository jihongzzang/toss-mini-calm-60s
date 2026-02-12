import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

interface RouterRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  state?: Record<string, unknown>;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', state, ...renderOptions }: RouterRenderOptions = {},
) {
  const entry = state ? { pathname: route, state } : route;
  return render(
    <MemoryRouter initialEntries={[entry]}>{ui}</MemoryRouter>,
    renderOptions,
  );
}

/** vi.setSystemTime 래퍼 */
export function mockDate(isoString: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoString));
}

export function restoreDate() {
  vi.useRealTimers();
}

/** 결정적 Math.random mock */
export function mockRandom(sequence: number[]) {
  let i = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    const v = sequence[i % sequence.length];
    i++;
    return v;
  });
}

export function restoreRandom() {
  vi.restoreAllMocks();
}
