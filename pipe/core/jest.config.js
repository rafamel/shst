const hook = require('../../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const jest = require('../../setup/jest.config');

module.exports = {
  ...jest,
  collectCoverageFrom: jest.collectCoverageFrom.concat(
    jest.collectCoverageFrom[0].replace('src', 'out')
  )
};
