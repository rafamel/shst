const path = require('path');
const dir = (file) => path.join(CONFIG_DIR, file);
const series = (...x) => `(${x.map((x) => x || 'shx echo').join(') && (')})`;
// prettier-ignore
const scripts = (x) => Object.entries(x)
  .reduce((m, [k, v]) => (m.scripts[k] = v || 'shx echo') && m, { scripts: {} });
const { ROOT_DIR, OUT_DIR, CONFIG_DIR, EXT } = require('./project.config');
const DOT_EXT = '.' + EXT.replace(/,/g, ',.');

const docker = `docker run -ti --rm --name go-sh-build \
--mount type=bind,source=${ROOT_DIR},target=/go/app \
golang:1.11.5-alpine /bin/sh -x /go/app/transpile/docker.sh`;

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: {
    default:
      'cross-env NODE_ENV=production' +
      ' nps lint build.prepare build.transpile build.process validate',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR}"]`,
      `shx mkdir ${OUT_DIR} ${OUT_DIR}/src ${OUT_DIR}/lib`
    ),
    transpile: `exits --log silent "${docker}" -- "docker rm go-sh-build"`,
    process: series(
      'node transforms/expose-packages',
      // Minify
      'minify build/src/exposed.js --out-file build/lib/index.js --mangle.topLevel',
      // TODO build types from source
      'shx cp sh.types.json build/lib/'
    )
  },
  fix: [
    'prettier',
    `--write "./**/*.{${EXT},json,scss}"`,
    `--config "${dir('.prettierrc.js')}"`,
    `--ignore-path "${dir('.prettierignore')}"`
  ].join(' '),
  lint: {
    default: `eslint ./ --ext ${DOT_EXT} -c ${dir('.eslintrc.js')}`,
    scripts: 'jake lintscripts["' + __dirname + '"]'
  },
  test: series('nps lint', 'cross-env NODE_ENV=test jest'),
  validate: series('nps test lint.scripts', 'jake run:zero["npm outdated"]'),
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    `jake run:zero["shx rm -r ${OUT_DIR} out coverage"]`,
    'shx rm -rf node_modules'
  )
});
