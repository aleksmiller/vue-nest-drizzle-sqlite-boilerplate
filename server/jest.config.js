module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^../lib/(.*)$': '<rootDir>/lib/$1',
    '^../db/(.*)$': '<rootDir>/db/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucia|@lucia-auth|oslo|@oslojs)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
};
