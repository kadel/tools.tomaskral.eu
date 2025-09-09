// Jest setup file
// Global test configuration and utilities

// Increase timeout for network requests
jest.setTimeout(10000);

// Suppress console.error during tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('YAML conversion error')) {
      // Allow YAML conversion errors (they're expected in tests)
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test helpers
global.expectValidJson = (obj) => {
  expect(typeof obj).toBe('object');
  expect(obj).not.toBeNull();
  expect(Array.isArray(obj) || obj.constructor === Object).toBe(true);
};

global.expectErrorResponse = (response) => {
  expect(response.body).toHaveProperty('error');
  expect(response.body).toHaveProperty('message');
  expect(typeof response.body.error).toBe('string');
  expect(typeof response.body.message).toBe('string');
};