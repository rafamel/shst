const path = require('path');
const { EXT_JS, EXT_TS } = require('../project.config');

const file = process.argv.slice(-1)[0];

// https://github.com/babel/babel/issues/8652
require('@babel/register')({
  extensions: (EXT_JS + ',' + EXT_TS).split(',').map((x) => '.' + x)
});
const filePath = file[0] === '/' ? file : path.join(process.cwd(), file);
require(filePath);
