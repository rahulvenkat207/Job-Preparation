const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ['<rootDir>/jest.globals.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/__tests__/**/*.spec.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/layout.tsx',
    '!src/**/page.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Override test environment for API routes
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Transform ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-resizable-panels|react-markdown|remark-.*|unified|bail|is-plain-obj|trough|vfile|unist-.*|micromark.*|decode-named-character-reference|character-entities|mdast-.*|escape-string-regexp|markdown-table|longest-streak|zwitch|unist-util-.*|hast-.*|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|html-url-attributes|ccount|stringify-entities|@t3-oss)/)',
  ],
  // Hide skipped tests from output
  verbose: false,
  // Only show summary for passed/failed tests
  silent: false,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

