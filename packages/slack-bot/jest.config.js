/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // Ignores the utility functions folder
  testPathIgnorePatterns: ['/__fixtures__/', '/__utils__/'],

  // Global setup configuration
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
};
