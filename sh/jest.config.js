const { EXT_JS, EXT_TS, ROOT_DIR } = require('../project.config');
const EXT = EXT_JS + ',' + EXT_TS;
const EXT_ARR = EXT.split(',').map((x) => x.trim());

module.exports = {
  rootDir: ROOT_DIR,
  testEnvironment: 'node',
  collectCoverage: false,
  moduleFileExtensions: EXT_ARR.concat(['json']),
  modulePathIgnorePatterns: ['<rootDir>/build', '<rootDir>/src/'],
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['<rootDir>/sh/test/setup/*.[jt]s?(x)']
};
