module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    require: p => require(p)
  }
};
