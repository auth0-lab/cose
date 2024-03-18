/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // preset: 'ts-jest/presets/default-esm', // or other ESM presets
  preset: './scripts/jest.browser.js', // or other ESM presets
  // testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  // //Setup file:
  setupFilesAfterEnv: [ './test/expect-browser.ts',  './test/setup.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(\\#.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      useESM: true,
      tsConfig: '<rootDir>/tsconfig/browser.json',
    },
  },
};
