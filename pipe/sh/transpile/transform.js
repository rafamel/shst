const hash = require('object-hash');

exports.expose = function expose(content) {
  // Expose packages
  const regex = /\$packages =[^;]+;/;
  const found = regex.exec(content);
  if (!found) throw Error('$packages not found');

  content = content.replace(
    regex,
    found[0] + '\n$module.exports.packages = $packages;'
  );

  return `
    export default function sh(window, global, Error, console) {
      const module = { exports: {} };
      const exports = module.exports;

      (function () { ${content} })();

      return module.exports;
    };
  `;
};

exports.validate = function validateLock(types, lock) {
  // Only interested in function types
  const functions = types.funcs;
  const lockHash = hash(functions, {
    algorithm: 'sha1',
    unorderedArrays: true,
    excludeKeys: (key) => key === 'doc'
  });

  if (lock !== lockHash) throw Error(`Lock hash has changed: ${lockHash}`);
};
