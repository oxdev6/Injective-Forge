/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/packages"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  moduleNameMapper: {
    "^@injective-devkit/core(.*)$": "<rootDir>/packages/core/src$1",
    "^@injective-devkit/exchange(.*)$": "<rootDir>/packages/exchange/src$1",
    "^@injective-devkit/wallet(.*)$": "<rootDir>/packages/wallet/src$1",
    "^@injective-devkit/react(.*)$": "<rootDir>/packages/react/src$1"
  }
};


