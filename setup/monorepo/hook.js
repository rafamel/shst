const { addHook } = require('pirates');

module.exports = function hook(path) {
  addHook(
    (code, filename) => {
      return code.replace(
        /require\(['"]\.\/project\.config(\.[a-zA-Z])?['"]\)/,
        `require('${path}')`
      );
    },
    { exts: ['.js'], matcher: () => true }
  );
};
