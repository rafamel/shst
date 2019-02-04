const { OUT_DIR, write } = require('./fsutil');

const obj = {};

module.exports = {
  add(id) {
    return (obj[id] = true);
  },
  end() {
    return write(OUT_DIR, 'markers.json', JSON.stringify(obj, null, 2));
  }
};
