const path = require('path');

module.exports = {
  // Whether to use TypeScript. Boolean.
  TYPESCRIPT: true,
  // Output build directory. String.
  OUT_DIR: 'lib',
  // Path to most tooling configuration files. String.
  CONFIG_DIR: path.join(__dirname, '../'),
  // Extensions for JS and TS files. Comma separated string (no dots).
  EXT_JS: 'js,mjs,jsx',
  EXT_TS: 'ts,tsx'
};
