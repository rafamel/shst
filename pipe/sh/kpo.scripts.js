const hook = require('../../setup/monorepo/hook');
hook(require.resolve('./project.config'));
const { scripts, options } = require('../../setup/monorepo/kpo.scripts');

require('@babel/register')({ extensions: ['.js', '.ts'] });
const { rm, ensure, copy, read, json, rw, log, line, kpo } = require('kpo');
const { validate, expose } = require('./src');

module.exports.options = options;
module.exports.scripts = {
  ...scripts,
  build: {
    default: kpo`--log warn build.prepare build.transpile build.transform build.settle`,
    $pack: log`Pack skipped`,
    $types: kpo`types`,
    $prepare: [
      log`\n[1/8] Preparing build...`,
      rm`pkg`,
      ['pkg/dist-node', 'pkg/dist-types'].map(ensure),
      copy(['README.md', 'package.json'], 'pkg'),
      json('pkg/package.json', (file, pkg) =>
        Object.assign(pkg, {
          main: 'dist-node/index.js',
          types: 'dist-types/index.d.ts'
        })
      )
    ],
    $transpile: [
      log`[2/8] Transpiling sh...`,
      'poseup -d transpile run transpile',
      rm`pkg/dist-node/sh.js.map`,
      copy(['static/index.js'], 'pkg/dist-node/'),
      copy(['static/index.d.ts'], 'pkg/dist-types/')
    ],
    $transform: [
      log`\n[3/8] Exposing packages...`,
      rw('pkg/dist-node/sh.js', (file, raw) => expose(raw)),
      log`[4/8] Verifying types lock...`,
      read('transpile/types.lock', (lock) =>
        json.fn('pkg/dist-node/sh.types.json', (file, types) => {
          log.fn`    Current lock: ${lock}`;
          validate(types, lock);
        })
      ),
      log`[5/8] Running tests...\n`,
      kpo`test.force`,
      log`\n[6/8] Running minification...`,
      line`minify pkg/dist-node/sh.js
        --out-file pkg/dist-node/sh.js --mangle.topLevel`
    ],
    $settle: [
      log`[7/8] Linking packages...\n`,
      kpo`@ link`,
      log`\n[8/8] Linting...`,
      kpo`lint types`
    ]
  }
};
