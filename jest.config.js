/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@rules/(.*)$': '<rootDir>/src/rules/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },

  // React Testing Library configuration
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/setupTests.ts',
    '!src/analysis/**' // Exclude analysis tools
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Higher coverage for critical modules
    'src/core/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/rules/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx}'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/analysis/'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: false
    }]
  },

  // Extensions to recognize
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Coverage reports
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Verbose output
  verbose: true
};