const hook = require('../../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const jest = require('../../setup/jest.config');

module.exports = {
  ...jest,
  collectCoverage: false,
  modulePathIgnorePatterns: jest.modulePathIgnorePatterns.concat([])
};
