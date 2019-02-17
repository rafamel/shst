const pkg = require('./package.json');
const path = require('path');

module.exports = {
  name: `${pkg.name} ${pkg.version}`,
  mode: 'file',
  theme: 'default',
  includeDeclarations: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: true,
  readme: path.join(__dirname, '../README.md'),
  exclude: [
    '**/internal/**/*',
    '**/test/**/*',
    '**/core/**/util*',
    '**/core/**/types*',
    '**/core/**/constants*',
    '**/utils/**/*',
    '**/constants*'
  ]
};
