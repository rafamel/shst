const hook = require('../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const babel = require('../setup/.babelrc');

module.exports = {
  ...babel,
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          '~': './src',
          '@shst/sh': './src/packages/sh',
          '@shst/core': './src/packages/core'
        }
      }
    ]
  ].concat(babel.plugins.slice(1))
};
