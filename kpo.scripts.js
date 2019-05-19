const { series, remove, kpo, ensure, silent } = require('kpo');

const vars = {
  validate: process.env.VALIDATE,
  semantic: !!process.env.SEMANTIC,
  commitizen: !!process.env.COMMITIZEN
};

module.exports.scripts = {
  bootstrap: ['lerna bootstrap', kpo`@sh build`, kpo`@core build`],
  link: 'lerna link',
  commit: series.env('git-cz', { COMMITIZEN: '#' }),
  validate: [
    vars.validate ? `kpo -d ${vars.validate} validate` : 'kpo :stream validate',
    ensure`coverage`,
    'lcov-result-merger "./{package,pipe}/**/*/coverage/lcov.info" coverage/lcov.info',
    kpo`:raise --dry --fail`,
    silent`npm outdated`
  ],
  update: ['npm update', 'npm outdated'],
  outdated: 'npm outdated',
  clean: {
    default: kpo`clean.top clean.modules`,
    top: remove([`./pkg`, `./docs`, `./coverage`, `CHANGELOG.md`], {
      confirm: true
    }),
    modules: remove('./node_modules', { confirm: true })
  },
  /* Hooks */
  $precommit: [
    !vars.commitizen && Error(`Commit by running 'kpo commit'`),
    kpo`validate`
  ],
  prepublishOnly: Error(`Run 'kpo @package release'`),
  preversion: Error(`Run 'kpo @package semantic'`),
  version: kpo`preversion`
};
