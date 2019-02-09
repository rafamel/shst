const pkg = require('./package/package.json');
const path = require('path');

const exec = RegExp.prototype.exec;
RegExp.prototype.exec = function(str) {
  if (!str || String(this) !== '/__module_map__/') {
    return exec.call(this, str);
  }

  if (str.includes('node_modules')) return null;

  let ans;
  if (str.includes('/pipe/')) {
    ans = new RegExp('.*/pipe/([\\w\\-_]+)/').exec(str)[1];
    if (ans === 'core') ans = 'nodes';
  } else if (str.includes('/typings/')) {
    ans = new RegExp('.*/typings/([\\w\\-_]+)').exec(str)[1];
  }

  return {
    0: str,
    1: ans || 'api',
    index: 0,
    input: str
  };
};

module.exports = {
  name: pkg.name,
  mode: 'modules',
  theme: 'default',
  includeDeclarations: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: true,
  'external-modulemap': ['__module_map__'],
  readme: path.join(__dirname, 'README.md'),
  tsConfig: path.join(__dirname, 'package/typings/tsconfig.json'),
  exclude: [
    '**/internal/**/*',
    '**/pipe/sh/**/*',
    '**/utils/**/*',
    '**/constants.*'
  ]
};
