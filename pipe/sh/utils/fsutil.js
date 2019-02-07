const path = require('path');
const fs = require('fs');

module.exports = {
  read(dir, file) {
    return String(fs.readFileSync(path.join(dir, file)));
  },
  write(dir, file, content) {
    return fs.writeFileSync(path.join(dir, file), content);
  }
};
