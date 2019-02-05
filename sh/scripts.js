const { ROOT_DIR, CONFIG_DIR } = require('../project.config');

const docker = `docker run -ti --rm --name go-sh-build \
--mount type=bind,source=${ROOT_DIR},target=/go/src/app \
golang:1.11.5-alpine /bin/sh -x /go/src/app/sh/docker.sh`;

// TODO prevent and test for "global" pollution (gopher)
module.exports = {
  default: 'nps sh.prepare sh.build sh.process sh.test sh.core sh.raise',
  prepare: [
    'jake run:zero["shx rm -r sh/out"',
    'shx mkdir sh/out sh/out/sh sh/out/core'
  ].join(' && '),
  build: `exits --log silent "${docker}" -- "docker rm go-sh-build"`,
  process:
    'minify sh/out/sh.0.gopher.js --out-file sh/out/sh/index.js --mangle.topLevel',
  /* TODO Commented out as test cases are pending */
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
  test: `cross-env NODE_ENV=test jest --config=./sh/jest.config.js sh/test/setup/final.js`,
  core: [
    'node scripts/babel sh/core',
    `prettier --write "./sh/out/core/*.{ts,js}" --config "${CONFIG_DIR}/.prettierrc.js" --ignore-path`
  ].join(' && '),
  raise: [
    `jake run:zero["shx rm -r src/lib"]`,
    `shx mkdir src/lib`,
    `shx cp -r sh/out/sh src/lib/sh`,
    `shx cp -r sh/out/core src/lib/core`
  ].join(' && ')
};
