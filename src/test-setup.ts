import { vi } from 'vitest';

// Mock indexedDB for Dexie
import 'fake-indexeddb/auto';

// Load dayjs plugins (needed for isSameOrBefore/isSameOrAfter in engine)
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Mock Tauri modules (for browser-only test environment)
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn(),
  },
}));

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] || null,
});

// Mock navigator
vi.stubGlobal('navigator', {
  language: 'en-US',
});

// Mock custom events
vi.stubGlobal('CustomEvent', class extends Event {
  detail: any;
  constructor(type: string, init?: CustomEventInit) {
    super(type, init);
    this.detail = init?.detail;
  }
});
