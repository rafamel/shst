const sh = require('./sh');
const declaration = require('./sh.types.json');
const PKG_PATH = 'mvdan.cc/sh/v3/syntax';

module.exports = Object.assign(sh, {
  path: PKG_PATH,
  package: sh.packages[PKG_PATH],
  declaration
});
