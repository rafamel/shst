const path = require('path');
const dir = (file) => path.join(CONFIG_DIR, file);
const series = (...x) => `(${x.map((x) => x || 'shx echo').join(') && (')})`;
// prettier-ignore
const scripts = (x) => Object.entries(x)
  .reduce((m, [k, v]) => (m.scripts[k] = v || 'shx echo') && m, { scripts: {} });
const { ROOT_DIR, OUT_DIR, CONFIG_DIR, EXT } = require('./project.config');
const DOT_EXT = '.' + EXT.replace(/,/g, ',.');

const docker = `docker run -ti --rm --name go-sh-build \
--mount type=bind,source=${ROOT_DIR},target=/go/src/app \
golang:1.11.5-alpine /bin/sh -x /go/src/app/transpile/docker.sh`;

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: {
    default:
      'cross-env NODE_ENV=production' +
      ' nps lint build.prepare build.transpile build.process validate',
    prepare: series(
      `jake run:zero["shx rm -r ${OUT_DIR} out"]`,
      `shx mkdir ${OUT_DIR} out`
    ),
    transpile: `exits --log silent "${docker}" -- "docker rm go-sh-build"`,
    process:
      'minify out/sh.0.gopher.js --out-file lib/index.js --mangle.topLevel'
    // [
    //   /* TODO Commented out as test cases are pending */
    //   // Set markers
    //   'node transforms/set-markers',
    //   // Run test cases on markers
    //   `cross-env NODE_ENV=test jest test/setup/gopher-markers.js`,
    //   // Remove unmarked code
    //   'node transforms/remove-dead',
    //   // Minify
    //   'minify out/sh.2.no-dead.js --out-file lib/index.js --mangle.topLevel'
    // ].join(' && ')
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
  test: series('nps lint', 'cross-env NODE_ENV=test jest test/setup/final.js'),
  validate: 'nps lint.scripts test',
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    `jake run:zero["shx rm -r ${OUT_DIR} out coverage"]`,
    'shx rm -rf node_modules'
  )
});
