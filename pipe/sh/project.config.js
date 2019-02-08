const path = require('path');

module.exports = {
  ROOT_DIR: __dirname,
  // Output build directory. String.
  OUT_DIR: path.join(__dirname, 'build'),
  // Path to most tooling configuration files. String.
  CONFIG_DIR: path.join(__dirname, '../../'),
  // Extensions for JS and TS files. Comma separated string (no dots).
  EXT: 'js,mjs,jsx'
};
