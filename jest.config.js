export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/workers/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
