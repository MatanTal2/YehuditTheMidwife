import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest', // Use ts-jest preset
  moduleNameMapper: {
    // Handle CSS imports (if you're not using CSS modules)
    // If using CSS modules, Next.js specific Jest config might handle this automatically.
    // '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Covered by Next.js Jest preset

    // Handle module aliases (this will be automatically configured by Next.js jest preset)
    // based on the paths in tsconfig.json.
    // However, if you have aliases not in tsconfig.json's paths, you can add them here.
    // Example:
    // '^@/components/(.*)$': '<rootDir>/src/components/$1',
    // '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    // '^@/store/(.*)$': '<rootDir>/src/store/$1',
    // '^@/data/(.*)$': '<rootDir>/src/data/$1',
  },
  // If using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'], 
  transform: {
    // Use ts-jest for .ts/.tsx files
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
