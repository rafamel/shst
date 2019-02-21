const { EXT, ROOT_DIR } = require('./project.config');
const EXT_ARR = EXT.split(',').map((x) => x.trim());

module.exports = {
  rootDir: ROOT_DIR,
  testEnvironment: 'node',
  collectCoverage: false,
  moduleFileExtensions: EXT_ARR.concat(['json']),
  testPathIgnorePatterns: ['/node_modules/']
};
