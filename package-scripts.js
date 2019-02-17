const path = require('path');
const dir = (file) => path.join(CONFIG_DIR, file);
const series = (...x) => `(${x.map((x) => x || 'shx echo').join(') && (')})`;
// prettier-ignore
const scripts = (x) => Object.entries(x)
  .reduce((m, [k, v]) => (m.scripts[k] = v || 'shx echo') && m, { scripts: {} });
const {
  DOCS_DIR,
  CONFIG_DIR,
  RELEASE_BUILD,
  RELEASE_DOCS
} = require('./project.config');
const { COMMIT, COMMITIZEN, VERSION } = process.env;

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  setup: series('npm run @sh -- build', 'npm run @core -- build'),
  docs: series(
    `jake run:zero["shx rm -r ${DOCS_DIR}"]`,
    `cd package && typedoc --out ../${DOCS_DIR}`
  ),
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s -r 0',
  validate: {
    default: series(
      // prettier-ignore
      COMMIT && !COMMITIZEN && 'jake run:conditional[' +
          `"\nCommits should be done via 'npm run :commit'. Continue?",` +
          '"","exit 1",Yes,5]',
      'nps validate.md validate.all',
      'jake run:zero["npm outdated"]',
      COMMIT && `jake run:conditional["\nCommit?","","exit 1",Yes,5]`
    ),
    all: [
      'concurrently',
      '"npm run @sh -- validate"',
      '"npm run @core -- validate"',
      '"npm run @package -- validate"',
      '-n @sh,@core,@package -c gray.dim,gray,magenta --kill-others-on-fail'
    ].join(' '),
    md: `markdownlint README.md --config ${dir('markdown.json')}`
  },
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    'lerna run clean --stream',
    `jake run:zero["shx rm -r ${DOCS_DIR} CHANGELOG.md"]`,
    'shx rm -rf node_modules'
  ),
  // Private
  private: {
    version: series(
      'nps changelog',
      RELEASE_BUILD && 'npm run @package -- build',
      RELEASE_DOCS && 'nps docs'
    ),
    preversion: series(
      !VERSION &&
        'jake run:conditional[' +
          `"\nVersion bumps should be done via 'npm run :version'. Continue?",` +
          '"","exit 1",Yes,5]',
      'shx echo "Recommended version bump is:"',
      'conventional-recommended-bump --preset angular --verbose',
      `jake run:conditional["\nContinue?","","exit 1",Yes]`
    )
  }
});
