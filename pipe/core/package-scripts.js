const path = require('path');
const dir = (file) => path.join(CONFIG_DIR, file);
const series = (...x) => `(${x.map((x) => x || 'shx echo').join(') && (')})`;
// prettier-ignore
const scripts = (x) => Object.entries(x)
  .reduce((m, [k, v]) => (m.scripts[k] = v || 'shx echo') && m, { scripts: {} });
const {
  TYPESCRIPT: TS,
  OUT_DIR,
  CONFIG_DIR,
  EXT_JS,
  EXT_TS
} = require('./project.config');
const EXT = EXT_JS + ',' + EXT_TS;
const DOT_EXT = '.' + EXT.replace(/,/g, ',.');

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: {
    default:
      'cross-env NODE_ENV=production' +
      ' nps validate build.prepare build.render build.raise',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR}"]`,
      `shx mkdir ${OUT_DIR}`
    ),
    render: series(
      `node ${dir('scripts/babel')} src`,
      `shx cp -r src/render/include/* ${OUT_DIR}/`,
      [
        'prettier',
        `--write "./build/**/*.{${EXT},json,scss}"`,
        `--config "${dir('.prettierrc.js')}"`,
        `--ignore-path`
      ].join(' '),
      `eslint ./build --ext ${DOT_EXT} -c ${dir('.eslintrc.js')}`,
      'tsc --noEmit --project tsconfig.build.json'
    ),
    raise: series(
      'shx echo "\nRaising core...\n"',
      'jake run:zero["shx rm -r ../../package/src/core"]',
      'jake run:zero["shx mkdir ../../package/src/core"]',
      'shx cp -r build/* ../../package/src/core/'
    )
  },
  watch: series(
    'nps build.prepare',
    `onchange "./src/**/*.{${EXT}}" --initial --kill -- ` +
      `jake clear run:exec["shx echo ⚡"] run:zero["nps private.watch"]`
  ),
  fix: [
    'prettier',
    `--write "./**/*.{${EXT},json,scss}"`,
    `--config "${dir('.prettierrc.js')}"`,
    `--ignore-path "${dir('.prettierignore')}"`
  ].join(' '),
  types: TS && 'tsc',
  lint: {
    default: `eslint ./src ./test --ext ${DOT_EXT} -c ${dir('.eslintrc.js')}`,
    scripts: 'jake lintscripts["' + __dirname + '"]'
  },
  test: series('nps lint types', 'cross-env NODE_ENV=test jest'),
  validate: series('nps test lint.scripts', 'jake run:zero["npm outdated"]'),
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    `jake run:zero["shx rm -r ${OUT_DIR} out coverage"]`,
    'shx rm -rf node_modules'
  ),
  // Private
  private: {
    watch:
      'concurrently "nps types" "nps lint" "nps build.render"' +
      ' -n tsc,eslint,render -c magenta,yellow,green'
  }
});
