const { log, series } = require('kpo');
const project = require('./project.config');
const { scripts, options } = require('../kpo.scripts');
const chalk = require('chalk');

const vars = {
  root: project.get('paths.root'),
  validate: process.env.VALIDATE,
  semantic: !!process.env.SEMANTIC,
  release: !!process.env.RELEASE
};

const error = Error(`Task should be run monorepo-wide`);
module.exports.options = options;
module.exports.scripts = {
  ...scripts,
  commit: [
    log`${chalk.bold.yellow('\nWARN:')} Validating only ${vars.root}`,
    series.env('kpo @root commit --', { VALIDATE: vars.root })
  ],
  semantic: !vars.semantic && error,
  release: !vars.release && error,
  changelog: log`Changelog skipped`,
  /* Hooks */
  prepublishOnly: !vars.release && error,
  $precommit: Error(`Hooks should be set on monorepo root`)
};
