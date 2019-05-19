const hook = require('../../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const typedoc = require('../../setup/typedoc');

module.exports = {
  ...typedoc,
  exclude: typedoc.exclude.concat([])
};
