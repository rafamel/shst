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
      ' nps validate build.prepare build.render build.transpile build.declaration',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR}"]`,
      `shx mkdir ${OUT_DIR} ${OUT_DIR}/src ${OUT_DIR}/lib`
    ),
    render: series(
      `node ${dir('scripts/babel')} src`,
      [
        'prettier',
        `--write "./build/src/**/*.{${EXT},json,scss}"`,
        `--config "${dir('.prettierrc.js')}"`,
        `--ignore-path`
      ].join(' '),
      `eslint ./build/src --ext ${DOT_EXT} -c ${dir('.eslintrc.js')}`,
      'tsc --noEmit --project ttsconfig.json'
    ),
    transpile: `babel build/src --out-dir ${OUT_DIR}/lib --extensions ${DOT_EXT} --source-maps inline`,
    declaration: series(
      TS &&
        `tsc --emitDeclarationOnly --project ttsconfig.json --outDir ${OUT_DIR}/lib`,
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
