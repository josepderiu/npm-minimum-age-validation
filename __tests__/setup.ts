// Test setup file
import { jest } from '@jest/globals';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
const originalConsole = global.console;

beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
  jest.clearAllMocks();
});
