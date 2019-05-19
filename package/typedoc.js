const hook = require('../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const typedoc = require('../setup/typedoc');

const path = require('path');
module.exports = {
  ...typedoc,
  readme: path.join(__dirname, '../README.md'),
  exclude: typedoc.exclude.concat([
    '**/utils/**/*',
    '**/constants*',
    '**/packages/sh/*',
    '**/packages/core/!(enum|from-json|interface|struct)*'
  ])
};
