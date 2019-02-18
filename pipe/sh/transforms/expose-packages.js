const { read, write } = require('../utils/fsutil');

let gopher = read(__dirname, '../build/src/gopher.js');
const regex = /\$packages =[^;]+;/;
const found = regex.exec(gopher);
if (!found) throw Error('$packages not found');
gopher = gopher.replace(
  regex,
  found[0] + '\n$module.exports.packages = $packages;'
);
write(__dirname, '../build/src/exposed.js', gopher);
