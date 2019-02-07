const { write } = require('./fsutil');

const store = {};

module.exports = {
  add(id) {
    return (store[id] = true);
  },
  end() {
    return write(
      __dirname,
      '../out/sh.markers.json',
      JSON.stringify(store, null, 2)
    );
  }
};
