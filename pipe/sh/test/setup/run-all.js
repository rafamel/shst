const path = require('path');
const fs = require('fs');

const regex = /\.test\.(js|ts)$/;

module.exports = function runAll(...args) {
  function run(dir) {
    fs.readdirSync(dir).forEach((name) => {
      const item = path.join(dir, name);

      if (fs.statSync(item).isDirectory()) {
        run(item);
      } else if (regex.exec(item)) {
        const name = path.parse(item).base.replace(regex, '');
        describe(name, () => require(item)(...args));
      }
    });
  }

  return run(path.join(__dirname, '../'));
};
