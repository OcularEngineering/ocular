module.exports = {
  globals: {
    preset: 'ts-jest',
    testEnvironment: 'node',
    "ts-jest": {
      tsconfig: "tsconfig.spec.json",
      isolatedModules: false,
    },
  },
  transform: {
    "^.+\\.[jt]s?$": "ts-jest",
  },
  transformIgnorePatterns: [
   "/node_modules/(?!(axios)/).*"
  ],
  testEnvironment: `node`,
  moduleFileExtensions: [`js`, `jsx`, `ts`, `tsx`, `json`],
}