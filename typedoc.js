const pkg = require('./package/package.json');
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
  readme: path.join(__dirname, 'README.md'),
  tsConfig: path.join(__dirname, 'package/typings/tsconfig.json'),
  exclude: [
    '**/internal/**/*',
    '**/pipe/sh/**/*',
    '**/pipe/core/**/helper*',
    '**/pipe/core/**/types*',
    '**/utils/**/*',
    '**/constants*'
  ]
};
