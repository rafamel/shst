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
  excludeNotExported: false,
  readme: path.join(__dirname, '../README.md'),
  exclude: [
    '**/core/**/constants*',
    '**/core/**/externalize*',
    '**/core/**/from-json*',
    '**/core/**/pkg*',
    '**/core/**/prototypes*',
    '**/core/**/types*',
    '**/core/**/util*',
    '**/test/**/*',
    '**/utils/**/*',
    '**/constants*'
  ]
};
