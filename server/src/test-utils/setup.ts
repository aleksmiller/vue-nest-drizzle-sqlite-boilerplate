// Global test setup
// This file runs before all tests

// Mock ESM modules that Jest can't handle
jest.mock('lucia', () => ({
  generateId: jest.fn(
    () => 'mock-id-' + Math.random().toString(36).substr(2, 9),
  ),
}));

jest.mock('oslo/password', () => ({
  Argon2id: jest.fn().mockImplementation(() => ({
    hash: jest.fn((password: string) => Promise.resolve('hashed-' + password)),
    verify: jest.fn((hash: string, password: string) =>
      Promise.resolve(hash === 'hashed-' + password),
    ),
  })),
}));
