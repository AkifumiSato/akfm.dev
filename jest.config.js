const nextJest = require('next/jest')
const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  moduleNameMapper: {
    '^@/(.+)': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
