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
      ' nps validate build.prepare build.init build.transpile build.declaration',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR} out"]`,
      `shx mkdir ${OUT_DIR} out`
    ),
    init: series(
      `node ${dir('scripts/babel')} src`,
      `shx cp -r tape/* out`,
      [
        'prettier',
        `--write "./out/**/*.{${EXT},json,scss}"`,
        `--config "${dir('.prettierrc.js')}"`,
        `--ignore-path`
      ].join(' '),
      `eslint ./out --ext ${DOT_EXT} -c ${dir('.eslintrc.js')} --no-ignore`,
      'tsc --noEmit --project ttsconfig.json',
      'shx cp out/core.types.json lib/'
    ),
    transpile: `cross-env BABEL_ENV=transpile babel out --out-dir ${OUT_DIR} --extensions ${DOT_EXT} --source-maps inline`,
    declaration: series(
      TS &&
        `tsc --emitDeclarationOnly --project ttsconfig.json --outDir ${OUT_DIR}`,
      `shx echo "${TS ? 'Declaration files built' : ''}"`
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
  validate: 'nps test lint.scripts',
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    `jake run:zero["shx rm -r ${OUT_DIR} out coverage"]`,
    'shx rm -rf node_modules'
  ),
  // Private
  private: {
    watch:
      'concurrently "nps types" "nps lint"' + ' -n tsc,eslint -c magenta,yellow'
  }
});
