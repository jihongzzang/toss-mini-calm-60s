import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ── Cleanup ──
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// ── Web Audio API Mock ──
function createMockGainNode() {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn().mockReturnThis(),
      linearRampToValueAtTime: vi.fn().mockReturnThis(),
      exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
      cancelScheduledValues: vi.fn().mockReturnThis(),
    },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  };
}

function createMockOscillator() {
  return {
    type: 'sine',
    frequency: {
      value: 440,
      setValueAtTime: vi.fn().mockReturnThis(),
      exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
      linearRampToValueAtTime: vi.fn().mockReturnThis(),
    },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockBiquadFilter() {
  return {
    type: 'lowpass',
    frequency: {
      value: 350,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    Q: { value: 1 },
    gain: { value: 0 },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  };
}

function createMockBufferSource() {
  return {
    buffer: null,
    loop: false,
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockWaveShaper() {
  return {
    curve: null,
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  };
}

class AudioContextMock {
  state = 'running';
  currentTime = 0;
  destination = {};
  sampleRate = 44100;
  createGain = vi.fn(createMockGainNode);
  createBufferSource = vi.fn(createMockBufferSource);
  createOscillator = vi.fn(createMockOscillator);
  createBiquadFilter = vi.fn(createMockBiquadFilter);
  createWaveShaper = vi.fn(createMockWaveShaper);
  createBuffer = vi.fn((_channels: number, length: number, _sampleRate: number) => ({
    getChannelData: vi.fn(() => new Float32Array(length)),
    length,
  }));
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockImplementation(() => {
    this.state = 'closed';
    return Promise.resolve(undefined);
  });
}

(globalThis as Record<string, unknown>).AudioContext = AudioContextMock;
(globalThis as Record<string, unknown>).webkitAudioContext = AudioContextMock;
// Also set on window for jsdom environments where window !== globalThis
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).AudioContext = AudioContextMock;
  (window as Record<string, unknown>).webkitAudioContext = AudioContextMock;
}

// ── localStorage Mock ──
const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// ── @apps-in-toss/web-bridge Mock ──
vi.mock('@apps-in-toss/web-bridge', () => ({
  generateHapticFeedback: vi.fn().mockResolvedValue(undefined),
  SafeAreaInsets: {
    get: vi.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
    subscribe: vi.fn((opts: Record<string, unknown>) => {
      // 호출 시 바로 onEvent 실행하지 않음 — 필요하면 테스트에서 수동 트리거
      return () => {}; // unsubscribe
    }),
  },
}));

// ── @toss/tds-mobile Mock ──
vi.mock('@toss/tds-mobile', () => {
  const React = require('react');

  // ConfirmDialog: open, title, description, confirmButton, cancelButton, onClose
  const ConfirmDialog = ({ open, title, description, confirmButton, cancelButton, onClose }: Record<string, unknown>) =>
    open
      ? React.createElement('div', { 'data-testid': 'tds-confirmdialog' },
          title ? React.createElement('div', { 'data-testid': 'confirm-title' }, title) : null,
          description ? React.createElement('div', { 'data-testid': 'confirm-description' }, description) : null,
          cancelButton ?? null,
          confirmButton ?? null,
        )
      : null;
  ConfirmDialog.ConfirmButton = ({ children, onClick }: Record<string, unknown>) =>
    React.createElement('button', { 'data-testid': 'confirm-confirm-btn', onClick }, children);
  ConfirmDialog.CancelButton = ({ children, onClick }: Record<string, unknown>) =>
    React.createElement('button', { 'data-testid': 'confirm-cancel-btn', onClick }, children);

  // AlertDialog: open, title, description, alertButton, onClose
  const AlertDialog = ({ open, title, description, alertButton, onClose }: Record<string, unknown>) =>
    open
      ? React.createElement('div', { 'data-testid': 'tds-alertdialog' },
          title ? React.createElement('div', null, title) : null,
          description ? React.createElement('div', null, description) : null,
          alertButton ?? null,
        )
      : null;
  AlertDialog.AlertButton = ({ children, onClick }: Record<string, unknown>) =>
    React.createElement('button', { 'data-testid': 'alert-confirm-btn', onClick }, children);

  // Asset with Icon, Frame, frameShape
  const Asset = ({ name, ...props }: Record<string, unknown>) =>
    React.createElement('span', { 'data-testid': `tds-asset-${name}`, ...props });
  Asset.Icon = ({ name, color, ...props }: Record<string, unknown>) =>
    React.createElement('span', { 'data-testid': `tds-icon-${name}`, style: { color }, ...props });
  Asset.Frame = ({ content, ...props }: Record<string, unknown>) =>
    React.createElement('span', { 'data-testid': 'tds-frame', ...props }, content);
  Asset.frameShape = {
    CleanW16: 'CleanW16',
    CleanW20: 'CleanW20',
    CleanW24: 'CleanW24',
    CircleXSmall: 'CircleXSmall',
    CircleSmall: 'CircleSmall',
    CircleMedium: 'CircleMedium',
    CircleLarge: 'CircleLarge',
    SquircleSmall: 'SquircleSmall',
    SquircleLarge: 'SquircleLarge',
  };

  return {
    Text: ({ children, ...props }: Record<string, unknown>) =>
      React.createElement('span', { 'data-testid': 'tds-text', ...props }, children),
    Button: ({ children, onClick, ...props }: Record<string, unknown>) =>
      React.createElement('button', { 'data-testid': 'tds-button', onClick, ...props }, children),
    ProgressBar: ({ progress, ...props }: Record<string, unknown>) =>
      React.createElement('div', { 'data-testid': 'tds-progressbar', 'data-progress': progress, ...props }),
    ConfirmDialog,
    AlertDialog,
    Asset,
    ThemeProvider: ({ children }: Record<string, unknown>) => children,
  };
});

// ── @toss/tds-mobile-ait Mock ──
vi.mock('@toss/tds-mobile-ait', () => ({
  TDSMobileAITProvider: ({ children }: Record<string, unknown>) => children,
}));

// ── document.visibilityState ──
Object.defineProperty(document, 'visibilityState', {
  writable: true,
  configurable: true,
  value: 'visible',
});

// ── performance.now ──
if (typeof globalThis.performance === 'undefined') {
  (globalThis as Record<string, unknown>).performance = { now: vi.fn(() => Date.now()) };
}

// ── requestAnimationFrame / cancelAnimationFrame ──
let rafId = 0;
(globalThis as Record<string, unknown>).requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  rafId++;
  setTimeout(() => cb(performance.now()), 16);
  return rafId;
});
(globalThis as Record<string, unknown>).cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// ── window ──
(globalThis as Record<string, unknown>).window = globalThis;
