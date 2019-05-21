const hook = require('../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const { scripts, options } = require('../setup/kpo.scripts');

const { log, series, move, kpo, rm, copy } = require('kpo');
const chalk = require('chalk');
const project = require('./project.config');

const vars = {
  root: project.get('paths.root'),
  docs: project.get('paths.docs'),
  typescript: project.get('typescript')
};

const fail = { fail: true };
module.exports.options = options;
module.exports.scripts = {
  ...scripts,
  build: {
    ...scripts.build,
    pack: [
      scripts.build.pack,
      copy(['../README.md', '../LICENSE', '../CHANGELOG.md'], { to: 'pkg' }),
      copy('../pipe/sh/pkg/SH.LICENSE', { to: 'pkg' }, fail),
      copy('../pipe/sh/pkg/dist-src', 'pkg/dist-src/packages/sh', fail),
      copy('../pipe/sh/pkg/dist-node', 'pkg/dist-node/packages/sh', fail),
      copy('../pipe/sh/pkg/dist-types', 'pkg/dist-types/packages/sh', fail),
      copy('../pipe/core/pkg/dist-src', 'pkg/dist-src/packages/core', fail),
      copy('../pipe/core/pkg/dist-node', 'pkg/dist-node/packages/core', fail),
      copy('../pipe/core/pkg/dist-types', 'pkg/dist-types/packages/core', fail)
    ]
  },
  commit: [
    log`${chalk.bold.yellow('\nWARN:')} Validating only ${vars.root}`,
    series.env('kpo @root commit --', { VALIDATE: vars.root })
  ],
  lint: {
    ...scripts.lint,
    md: scripts.lint.md.replace('README.md', '../README.md')
  },
  docs: vars.typescript && [
    rm`${vars.docs}`,
    `typedoc ./pkg/dist-types --out "${vars.docs}"`
  ],
  changelog: [scripts.changelog, move(['CHANGELOG.md'], '../')],
  /* Hooks */
  $precommit: Error(`Hooks should be set on monorepo root`),
  version: [
    scripts.version,
    kpo`@ :stream --exclude package validate`,
    series('git add .', { cwd: '../' })
  ]
};
