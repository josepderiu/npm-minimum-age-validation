module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/cli.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 50,
      lines: 40,
      statements: 40
    }
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 10000,
  verbose: true
};