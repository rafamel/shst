const path = require('path');
const { default: slim } = require('slimconf');
const pkg = require('./package.json');

module.exports = slim({
  // Transpiles to esnext
  esnext: true,
  // Enables typescript and produce declaration files
  typescript: true,
  // Extensions allowed for each file type, as a comma separated string
  ext: {
    js: 'js,cjs,mjs,jsx',
    ts: 'ts,tsx,d.ts'
  },
  // Paths used on build
  paths: {
    root: __dirname,
    docs: path.join(__dirname, '../../docs', pkg.name)
  },
  release: {
    // Build project on version bump. Boolean.
    build: true,
    // Generate docs from TS on version bump. Boolean.
    docs: false
  }
});
