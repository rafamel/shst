const { ROOT_DIR, OUT_DIR } = require('../project.config');

const docker = `docker run -ti --rm --name go-sh-build \
--mount type=bind,source=${ROOT_DIR},target=/go/src/app \
golang:1.11.5-alpine /bin/sh -x /go/src/app/sh/docker.sh`;

module.exports = {
  default: 'nps sh.prepare sh.build sh.process sh.core sh.test',
  prepare: 'jake run:zero["shx rm -r sh/out" && shx mkdir sh/out',
  build: `exits --log silent "${docker}" -- "docker rm go-sh-build"`,
  process:
    'minify sh/out/sh.0.gopher.js --out-file sh/out/sh/index.js --mangle.topLevel',
  /* Commented out as test cases are pending */
  // [
  //   // Set markers
  //   'node sh/transforms/set-markers',
  //   // Run test cases on markers
  //   `cross-env NODE_ENV=test jest --config=./sh/jest.config.js sh/test/setup/gopher-markers.js`,
  //   // Remove unmarked code
  //   'node sh/transforms/remove-dead',
  //   // Minify
  //   'minify sh/out/sh.2.no-dead.js --out-file sh/out/sh/index.js --mangle.topLevel'
  // ].join(' && '),
  core: 'node scripts/babel sh/core',
  test: `cross-env NODE_ENV=test jest --config=./sh/jest.config.js sh/test/setup/final.js`,
  raise: [
    `shx cp -r sh/out/sh ${OUT_DIR}/`
    // core
  ].join(' && ')
};
