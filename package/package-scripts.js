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

// TODO add publish; build on publish
process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: {
    default:
      'cross-env NODE_ENV=production' +
      ' nps validate build.prepare build.transpile build.declaration build.promote',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR}"]`,
      `shx mkdir ${OUT_DIR}`,
      `jake fixpackage["${__dirname}","${OUT_DIR}"]`
    ),
    transpile: `babel src --out-dir ${OUT_DIR} --extensions ${DOT_EXT} --source-maps inline`,
    declaration: series(
      TS && `ttsc --project ttsconfig.json --outDir ${OUT_DIR}`,
      TS && `jake cpr["./src","${OUT_DIR}",d.ts]`,
      `shx echo "${TS ? 'Declaration files built' : ''}"`
    ),
    promote: series(
      `jake run:zero["mkdir ${OUT_DIR}/sh"]`,
      `shx cp -r ../pipe/sh/build/lib/* ${OUT_DIR}/sh/`
    )
  },
  watch: series(
    'nps build.prepare build.promote',
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
    `jake run:zero["shx rm -r ${OUT_DIR} coverage"]`,
    'shx rm -rf node_modules'
  ),
  // Private
  private: {
    watch:
      'concurrently "nps build.transpile" "nps build.declaration" "nps lint"' +
      ' -n babel,tsc,eslint -c green,magenta,yellow'
  }
});
