module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist", "starter-project"],
  setupFilesAfterEnv: ["jest-extended"],
};
