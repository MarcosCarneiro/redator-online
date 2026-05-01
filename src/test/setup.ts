import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocking some common environment variables
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.POSTGRES_URL = 'postgresql://user:password@localhost:5432/test';
process.env.BETTER_AUTH_SECRET = 'a'.repeat(32);
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'test-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

// Mocking window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
