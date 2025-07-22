import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client to avoid network calls in tests
vi.mock('./services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => ({ range: () => Promise.resolve({ data: [], error: null }) }) })
    })
  }
}));

// Mock LogConsole to prevent side effects and act warnings
vi.mock('./components/ui/LogConsole', () => ({
  default: () => null,
}));

// Mock HTMLMediaElement.play to avoid jsdom errors during tests
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  writable: true,
  value: vi.fn().mockResolvedValue(undefined)
});
